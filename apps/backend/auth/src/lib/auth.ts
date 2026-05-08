import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import {
	admin,
	apiKey,
	bearer,
	emailOTP,
	jwt,
	lastLoginMethod,
	openAPI,
	organization,
} from "better-auth/plugins";
import { authConfig } from "../auth.config";
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
			logger.info(ctx.path)
			// 🔐 User registered
			if (path === "/sign-up/email") {
				const newSession = context.newSession;
				if (newSession) {
					logger.info("🔐 User registered:", newSession.user);
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
					logger.info("🔓 User signed in:", user.email);
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
		autoSignIn: true,
		enabled: authConfig.DISABLE_SIGNUP !== "true",
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
			async sendVerificationOTP({ email, otp, type }) {
				logger.info(`Sending OTP (${type}) to: ${email} (OTP: ${otp})`);
				if (authConfig.DEFAULT_OTP && authConfig.NODE_ENV !== "development") return;
				try {
					await bus.publish(
						BusEvent.OTP_REQUESTED,
						{ email, otp, type },
						{ msgId: `otp_requested:${email}:${otp}` },
					);
					logger.info(`OTP bus event published for ${email} (${type})`);
				} catch (error) {
					logger.error("Failed to publish OTP event:", error);
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
			async sendInvitationEmail(data) {
				const inviteLink = `${authConfig.BASE_URL}/dashboard/login?inviteId=${data.id}`;
				logger.info("📧 Organization invitation email requested:", {
					email: data.email,
					organization: data.organization.name,
				});

				// Log invite URL in development for easy testing
				if (authConfig.NODE_ENV === "development") {
					logger.info("🔗 Invite URL (DEV):", inviteLink);
				}
			},
			organizationHooks: {
				afterCreateInvitation: async ({ invitation, inviter, organization }) => {
					const inviteLink = `${authConfig.BASE_URL}/dashboard/login?inviteId=${invitation.id}`;
					try {
						await bus.publish(
							BusEvent.INVITE_CREATED,
							{
								email: invitation.email,
								organizationName: organization.name,
								inviteLink,
								inviterName: inviter?.name || inviter.email.split("@")[0] || 'Someone',
								inviterEmail: inviter.email,
							},
							{ msgId: `invite_created:${invitation.id}` },
						);
						logger.info(`✅ Organization invite bus event published for ${invitation.email}`);
					} catch (error) {
						logger.error(`❌ Failed to publish organization invite event:${error}`);
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
						logger.info(`✅ Organization joined bus event published for ${user.email}`);
					} catch (error) {
						logger.error("❌ Failed to publish organization joined event:", error);
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
			logger.error("Failed to generate OpenAPI paths:", error);
			return {};
		}
	},
	components: async () => {
		try {
			const { components } = await getSchema();
			return components;
		} catch (error) {
			logger.error("Failed to generate OpenAPI components:", error);
			return {};
		}
	},
} as const;
