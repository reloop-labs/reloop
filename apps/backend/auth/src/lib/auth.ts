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
	after: createAuthMiddleware(async (ctx) => {
		if (ctx.path.startsWith("/sign-up")) {
			const newSession = ctx.context.newSession;
			if (newSession) {
				logger.info("🔐 User registered:", newSession.user);
				await bus.publish(BusEvent.USER_CREATED, {
					id: newSession.user.id,
					email: newSession.user.email,
					name: newSession.user.name,
				});
			}
		}
	}),
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
					await bus.publish(BusEvent.OTP_REQUESTED, { email, otp });
					logger.info(`OTP bus event published for ${email}`);
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
			sendInvitationEmail: async (data) => {
				const inviteLink = `${authConfig.BASE_URL}/dashboard/accept-invitation?id=${data.id}`;

				logger.info("📧 Organization invitation requested:", {
					email: data.email,
					organization: data.organization.name,
					role: data.role,
					inviter: data.inviter.user.email,
				});

				// Log invite URL in development for easy testing
				if (authConfig.NODE_ENV === "development") {
					logger.info("🔗 Invite URL (DEV):", inviteLink);
				}

				try {
					await bus.publish(BusEvent.INVITE_CREATED, {
						email: data.email,
						organizationName: data.organization.name,
						inviteLink,
					});
					logger.info(`✅ Organization invite bus event published for ${data.email}`);
				} catch (error) {
					logger.error("❌ Failed to publish organization invite event:", error);
				}
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
