import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import {
	sendOrganizationInviteEmail,
	sendPasswordResetEmail,
} from "@reloop/react-email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import {
	admin,
	apiKey,
	bearer,
	jwt,
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
			}
		}
	}),
	basePath: "/api/auth/v1",
	telemetry: { enabled: false },
	emailAndPassword: {
		autoSignIn: true,
		enabled: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			logger.info("🔐 Password reset requested for:", user.email);

			// Log reset URL and token only in development for easy testing
			if (authConfig.NODE_ENV === "development") {
				logger.info("🔗 Reset URL (DEV):", url);
				logger.info("🔑 Token (DEV):", token);
			}

			try {
				await sendPasswordResetEmail(user.email, url);
				logger.info(`✅ Password reset email sent to ${user.email}`);
			} catch (error) {
				logger.error("❌ Failed to send password reset email:", error);
				throw new Error("Failed to send password reset email");
			}
		},
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
					await sendOrganizationInviteEmail({
						email: data.email,
						inviteLink,
						organizationName: data.organization.name,
						inviterName: data.inviter.user.name || data.inviter.user.email,
						inviterEmail: data.inviter.user.email,
						role: data.role,
					});
					logger.info(`✅ Organization invite email sent to ${data.email} using ${inviteLink}`);
				} catch (error) {
					logger.error("❌ Failed to send organization invite email:", error);
					// Don't throw - invitation is still created, email just failed
				}
			},
		}),
		openAPI({ path: "/docs" }),
	],
	advanced: {
		cookiePrefix: "reloop",
		ipAddress: {
			ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
			disableIpTracking: false,
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
