import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt, organization } from "better-auth/plugins";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	basePath: "/api/auth/v1",
	telemetry: { enabled: false },
	emailAndPassword: { enabled: true },
	secret: process.env.BETTER_AUTH_SECRET || "FTMTTtY9DBvYkOf1D1rqYzRtqol2ZuaH",
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	trustedOrigins: ["*"],
	plugins: [
		jwt(),
		bearer(),
		organization(),
	],
	advanced: {
		cookiePrefix: "reloop",
		ipAddress: {
			ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
			disableIpTracking: false,
		},
	},
});
