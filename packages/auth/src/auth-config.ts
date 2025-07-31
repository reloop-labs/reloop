import type { BetterAuthOptions } from "better-auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import {
	admin,
	apiKey,
	bearer,
	jwt,
	openAPI,
	organization,
} from "better-auth/plugins";

export const config = {
	basePath: "/api/auth/v1/",
	user: {
		additionalFields: {
			activeMode: {
				type: "string",
				required: false,
				defaultValue: "dev",
				input: true,
			},
			activeOrganization: {
				type: "string",
				required: false,
				input: true,
			},
		},
	},

	emailAndPassword: {
		enabled: true,
	},
	secret: "FTMTTtY9DBvYkOf1D1rqYzRtqol2ZuaH",
	socialProviders: {},
	plugins: [
		jwt(),
		openAPI({
			path: "/docs",
		}),
		bearer(),
		organization(),
		admin(),
		apiKey({
			defaultPrefix: "rl",
			enableMetadata: true,
		}),
		inferAdditionalFields({
			user: {
				activeOrganization: {
					type: "string",
				},
				activeMode: {
					type: "string",
				},
			},
		}),
	],
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	trustedOrigins: ["*"],
	advanced: {
		cookiePrefix: "reloop",
		ipAddress: {
			ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
			disableIpTracking: false,
		},
	},
} satisfies BetterAuthOptions;
