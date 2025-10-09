import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
	admin,
	apiKey,
	bearer,
	jwt,
	openAPI,
	organization,
} from "better-auth/plugins";
import { sendPasswordResetEmail } from "./email-service";
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
	basePath: "/api/auth/v1",
	telemetry: { enabled: false },
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			console.log("🔐 Password reset requested for:", user.email);
			console.log("🔗 Reset URL:", url);
			console.log("🔑 Token:", token);

			try {
				console.log("📧 Attempting to send email...");
				await sendPasswordResetEmail(user.email, url);
				console.log(`✅ Password reset email sent to ${user.email}`);
			} catch (error) {
				console.error("❌ Failed to send password reset email:", error);
				throw new Error("Failed to send password reset email");
			}
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
		},
	},
	secret: process.env.BETTER_AUTH_SECRET,
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
			sendInvitationEmail: async () => {},
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
			console.error("Failed to generate OpenAPI paths:", error);
			return {};
		}
	},
	components: async () => {
		try {
			const { components } = await getSchema();
			return components;
		} catch (error) {
			console.error("Failed to generate OpenAPI components:", error);
			return {};
		}
	},
} as const;
