import { betterAuth } from "better-auth";
export const auth = betterAuth({
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
	basePath: "/api/auth/v1",
});

export type AuthInstance = typeof auth;
