import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import { admin, bearer, jwt, openAPI, organization } from "better-auth/plugins";
import { ac, dev, marketing, admin as orgAdmin } from "./permissions";
import { platformAc, platformRoles } from "./platform-permissions";
import { DEFAULT_USER_ROLE, PLATFORM_ADMIN_ROLE } from "./roles";

export const auth = betterAuth({
	baseURL: process.env.BASE_URL || "https://local.reloop.sh",
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
		organization({
			teams: {
				enabled: true,
				defaultTeam: {
					enabled: false,
				},
			},
			ac,
			roles: {
				orgAdmin,
				dev,
				marketing,
			},
			sendInvitationEmail: async () => {},
		}),
		openAPI({ path: "/docs" }),
	],
});

export type AuthInstance = typeof auth;
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session & {
	user: User & {
		activeOrganizationId: string;
	};
};
