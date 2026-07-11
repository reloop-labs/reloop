import { apiKeyClient } from "@better-auth/api-key/client";
import {
	adminClient,
	emailOTPClient,
	inferAdditionalFields,
	jwtClient,
	lastLoginMethodClient,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, orgRoles } from "./permissions";
import { platformAc, platformRoles } from "./platform-permissions";
import type { AuthInstance } from "./server";

const baseURL =
	process.env.NEXT_PUBLIC_URL ||
	process.env.NEXT_PUBLIC_APP_URL ||
	"https://local.reloop.sh";

export const authClient = createAuthClient({
	baseURL,
	basePath: "/api/auth/v1/",
	plugins: [
		adminClient({
			ac: platformAc,
			roles: platformRoles,
		}),
		apiKeyClient(),
		jwtClient(),
		organizationClient({
			ac,
			roles: orgRoles,
		}),
		inferAdditionalFields<AuthInstance>({}),
		emailOTPClient(),
		lastLoginMethodClient(),
	],
});
