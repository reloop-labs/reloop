import { apiKey } from "@better-auth/api-key";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import {
	admin,
	bearer,
	emailOTP,
	jwt,
	lastLoginMethod,
	openAPI,
	organization,
} from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { log } from "evlog";
import { authConfig } from "../auth.config";
import {
	PLAN_CREDITS,
	lagoCreateCustomer,
	lagoCreateSubscription,
} from "./lago";
import { redis } from "./redis";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	user: {
		additionalFields: {
			activeOrganizationId: {
				type: "string",
				required: false,
				input: true,
			},
			mode: {
				type: "string",
				required: false,
				input: true,
				defaultValue: "dev",
			},
		},
	},
	secondaryStorage: {
		get: async (key) => {
			return await redis.get(key);
		},
		set: async (key, value, ttl) => {
			if (ttl) await redis.set(key, value, ttl);
			else await redis.set(key, value);
		},
		delete: async (key) => {
			await redis.delete(key);
		},
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			const { path, context } = ctx;
			log.info({ message: String(ctx.path) });
			// 🔐 User registered
			if (path === "/sign-up/email-otp") {
				const newSession = context.newSession;
				if (newSession) {
					log.info({
						...{ data: newSession.user },
						message: "🔐 User registered:",
					});
					await bus.publish(
						BusEvent.USER_CREATED,
						{
							id: newSession.user.id,
							email: newSession.user.email,
							name: newSession.user.name || undefined,
						},
						{ msgId: `user_created:${newSession.user.email}` },
					);
				}
			}

			// 🔓 User signed in
			if (
				path === "/sign-in/email-otp" ||
				path === "/callback/google" ||
				path === "/callback/github"
			) {
				const data = context.newSession;
				if (data) {
					const { session, user } = data;
					log.info({ ...{ data: user.email }, message: "🔓 User signed in:" });
					// Use a 1-minute bucket for sign-in deduplication
					const bucket = Math.floor(Date.now() / 60000);
					await bus.publish(
						BusEvent.SIGNIN_DETECTED,
						{
							email: user.email,
							fullName: user.name || "User",
							browser: session.userAgent || "Unknown Browser",
							os: "Unknown OS",
							ip: session.ipAddress || "0.0.0.0",
							location: "Unknown Location",
						},
						{ msgId: `signin_detected:${user.email}:${bucket}` },
					);
				}
			}
		}),
	},
	basePath: "/api/auth/v1",
	telemetry: { enabled: false },
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		disableSignUp: authConfig.DISABLE_SIGNUP === "true",
	},
	socialProviders: {
		google: {
			clientId: authConfig.GOOGLE_CLIENT_ID as string,
			clientSecret: authConfig.GOOGLE_CLIENT_SECRET as string,
		},
		github: {
			clientId: authConfig.GITHUB_CLIENT_ID as string,
			clientSecret: authConfig.GITHUB_CLIENT_SECRET as string,
		},
	},
	secret: authConfig.BETTER_AUTH_SECRET,
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	trustedOrigins: ["*"],
	plugins: [
		jwt(),
		bearer(),
		admin(),
		apiKey({ defaultPrefix: "rl" }),
		lastLoginMethod({
			cookieName: "better-auth.last_used_login_method",
			maxAge: 60 * 60 * 24 * 30,
			customResolveMethod: (ctx) => {
				if (ctx.path.includes("/oauth/callback/google")) {
					return "google";
				}
				if (ctx.path.includes("/oauth/callback/github")) {
					return "github";
				}
				if (ctx.path.includes("/sign-up/email")) {
					return "email";
				}
				if (ctx.path.includes("/sign-in/email")) {
					return "email";
				}
				return null;
			},
		}),
		emailOTP({
			expiresIn: 60 * 15,
			allowedAttempts: 3,
			async sendVerificationOTP({ email, otp, type }) {
				log.info("server", `Sending OTP (${type}) to: ${email} (OTP: ${otp})`);
				if (authConfig.DEFAULT_OTP && authConfig.NODE_ENV !== "development")
					return;
				try {
					await bus.publish(
						BusEvent.OTP_REQUESTED,
						{ email, otp, type },
						{ msgId: `otp_requested:${email}:${otp}` },
					);
					log.info("server", `OTP bus event published for ${email} (${type})`);
				} catch (error) {
					log.error({
						...{ data: error },
						message: "Failed to publish OTP event:",
					});
					// If we are not using a default OTP, we must throw to notify the user
					if (!authConfig.DEFAULT_OTP) {
						throw new Error("Failed to send OTP email");
					}
				}
			},
			generateOTP() {
				if (authConfig.DEFAULT_OTP) return authConfig.DEFAULT_OTP;
				return Math.floor(100000 + Math.random() * 900000).toString();
			},
		}),
		organization({
			additionalFields: {
				organization: {
					billingEmail: {
						type: "string",
						required: false,
						input: true,
					},
					billingName: {
						type: "string",
						required: false,
						input: true,
					},
					externalCustomerId: {
						type: "string",
						required: false,
						input: true,
						unique: true,
					},
					status: {
						type: "string",
						required: false,
						input: true,
						defaultValue: "active",
					},
				},
			},
			async sendInvitationEmail(data) {
				const inviteLink = `${authConfig.BASE_URL}/dashboard/signup?inviteId=${data.id}`;
				log.info({
					...{
						email: data.email,
						organization: data.organization.name,
					},
					message: "📧 Organization invitation email requested:",
				});

				// Log invite URL in development for easy testing
				if (authConfig.NODE_ENV === "development") {
					log.info("server", `🔗 Invite URL (DEV): ${inviteLink}`);
				}

				const isResend =
					Date.now() - new Date(data.invitation.createdAt).getTime() > 5000;

				try {
					await bus.publish(
						BusEvent.INVITE_CREATED,
						{
							email: data.email,
							organizationName: data.organization.name,
							inviteLink,
							inviterName:
								data.inviter.user.name ||
								data.inviter.user.email.split("@")[0] ||
								"Someone",
							inviterEmail: data.inviter.user.email,
							isResend,
						},
						{ msgId: `invite_created:${data.id}:${Date.now()}` },
					);
					log.info(
						"server",
						`✅ Organization invite bus event published for ${data.email} (resend: ${isResend})`,
					);
				} catch (error) {
					log.error(
						"server",
						`❌ Failed to publish organization invite event:${error}`,
					);
				}
			},
			organizationHooks: {
				afterCreate: async ({ organization: org }) => {
					try {
						// Create Lago customer & starter subscription
						const customer = await lagoCreateCustomer({
							id: org.id,
							name: org.name,
							billingEmail: (org as any).billingEmail,
							billingName: (org as any).billingName,
						});

						const sub = await lagoCreateSubscription(customer.external_id, "starter");

						await db
							.update(schema.organization)
							.set({
								externalCustomerId: customer.external_id,
								lagoSubscriptionId: sub.external_id,
								creditsRemaining: PLAN_CREDITS.starter,
								monthlyCredits: PLAN_CREDITS.starter,
								planCode: "starter",
								subscriptionStatus: "active",
							})
							.where(eq(schema.organization.id, org.id));

						log.info({
							message: `Billing initialized for org ${org.id} (${customer.external_id})`,
						});
					} catch (err) {
						// Non-fatal: org is created, billing can be set up manually
						log.error({
							message: `Failed to initialize billing for org ${org.id}`,
							error: err,
						});
					}
				},
				afterAcceptInvitation: async ({ member, user, organization }) => {
					try {
						await bus.publish(
							BusEvent.ORGANIZATION_JOINED,
							{
								organizationId: organization.id,
								orgName: organization.name,
								userId: user.id,
								userEmail: user.email,
								memberName: user.name || user.email,
								role: member.role,
								inviterName: "Admin",
							},
							{ msgId: `org_joined:${organization.id}:${user.id}` },
						);
						log.info(
							"server",
							`✅ Organization joined bus event published for ${user.email}`,
						);

						// Set active organization for the user
						await db
							.update(schema.user)
							.set({ activeOrganizationId: organization.id })
							.where(eq(schema.user.id, user.id));
						log.info(
							"server",
							`✅ Active organization set to ${organization.id} for user ${user.id}`,
						);
					} catch (error) {
						log.error({
							...{ data: error },
							message:
								"❌ Failed to publish organization joined event or update user:",
						});
					}
				},
			},
		}),
		openAPI({
			path: "/docs",
		}),
	],
	advanced: {
		cookiePrefix: "reloop",
		ipAddress: {
			ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
		},
	},
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema> | null = null;

const getSchema = async () => {
	if (!_schema) {
		_schema = auth.api.generateOpenAPISchema();
	}
	return _schema;
};

export const OpenAPI = {
	getPaths: async (prefix = "/api/auth/v1") => {
		try {
			const { paths } = await getSchema();
			const reference: Record<string, any> = {};

			for (const path of Object.keys(paths)) {
				const pathData = paths[path];
				if (!pathData) continue;

				const key = prefix + path;
				reference[key] = { ...pathData };

				for (const method of Object.keys(pathData)) {
					const operation = reference[key][method];
					if (operation && typeof operation === "object") {
						operation.tags = ["Better Auth"];
					}
				}
			}

			return reference;
		} catch (error) {
			log.error({
				...{ data: error },
				message: "Failed to generate OpenAPI paths:",
			});
			return {};
		}
	},
	components: async () => {
		try {
			const { components } = await getSchema();
			return components;
		} catch (error) {
			log.error({
				...{ data: error },
				message: "Failed to generate OpenAPI components:",
			});
			return {};
		}
	},
} as const;
