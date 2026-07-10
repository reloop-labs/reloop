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

export const authClient = createAuthClient({
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
