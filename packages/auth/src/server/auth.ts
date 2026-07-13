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
import { handleAuthLifecycleEviction } from "../middleware/eviction/handle-auth-lifecycle-eviction";
import { ac, orgRoles } from "../permissions";
import { platformAc, platformRoles } from "../platform-permissions";
import { DEFAULT_USER_ROLE, PLATFORM_ADMIN_ROLE } from "../roles";
import { authServerConfig } from "./config";
import { redis } from "./redis";
import { sessionCacheRedis } from "./session-cache-redis";

/**
 * The single runtime Better Auth instance for Reloop.
 * Auth service mounts `auth.handler`; client/types derive from this config only.
 */
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

			// Near-instant session-validation cache eviction (shared Redis).
			// Logout → that token; password-change / org-switch → all user tokens.
			try {
				const cookieHeader =
					typeof ctx.headers?.get === "function"
						? ctx.headers.get("cookie")
						: null;
				const sessionUser =
					// biome-ignore lint/suspicious/noExplicitAny: Better Auth context shape
					(context as any)?.session?.user ??
					// biome-ignore lint/suspicious/noExplicitAny: Better Auth context shape
					(context as any)?.newSession?.user;
				await handleAuthLifecycleEviction(sessionCacheRedis, {
					path: String(path),
					cookieHeader,
					userId: sessionUser?.id ?? null,
				});
			} catch (err) {
				log.error({
					...{ data: err },
					message: "Session cache eviction failed",
				});
			}

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
		disableSignUp: authServerConfig.DISABLE_SIGNUP === "true",
	},
	socialProviders: {
		google: {
			clientId: authServerConfig.GOOGLE_CLIENT_ID as string,
			clientSecret: authServerConfig.GOOGLE_CLIENT_SECRET as string,
		},
		github: {
			clientId: authServerConfig.GITHUB_CLIENT_ID as string,
			clientSecret: authServerConfig.GITHUB_CLIENT_SECRET as string,
		},
	},
	secret: authServerConfig.BETTER_AUTH_SECRET,
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	trustedOrigins: ["*"],
	plugins: [
		jwt(),
		bearer(),
		admin({
			defaultRole: DEFAULT_USER_ROLE,
			adminRoles: [PLATFORM_ADMIN_ROLE],
			ac: platformAc,
			roles: platformRoles,
		}),
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
				if (
					authServerConfig.DEFAULT_OTP &&
					authServerConfig.NODE_ENV !== "development"
				)
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
					if (!authServerConfig.DEFAULT_OTP) {
						throw new Error("Failed to send OTP email");
					}
				}
			},
			generateOTP() {
				if (authServerConfig.DEFAULT_OTP) return authServerConfig.DEFAULT_OTP;
				return Math.floor(100000 + Math.random() * 900000).toString();
			},
		}),
		organization({
			ac,
			roles: orgRoles,
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
				const inviteLink = `${authServerConfig.BASE_URL}/dashboard/signup?inviteId=${data.id}`;
				log.info({
					...{
						email: data.email,
						organization: data.organization.name,
					},
					message: "📧 Organization invitation email requested:",
				});

				// Log invite URL in development for easy testing
				if (authServerConfig.NODE_ENV === "development") {
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

type OpenAPIPathItem = Record<string, unknown> & {
	[method: string]: { tags?: string[] } | unknown;
};

export const OpenAPI = {
	getPaths: async (prefix = "/api/auth/v1") => {
		try {
			const { paths } = await getSchema();
			const reference: Record<string, OpenAPIPathItem> = {};

			for (const path of Object.keys(paths)) {
				const pathData = paths[path];
				if (!pathData) continue;

				const key = prefix + path;
				const item: OpenAPIPathItem = { ...pathData };
				reference[key] = item;

				for (const method of Object.keys(pathData)) {
					const operation = item[method];
					if (operation && typeof operation === "object") {
						(operation as { tags?: string[] }).tags = ["Better Auth"];
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
