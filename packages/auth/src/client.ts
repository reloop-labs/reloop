import {
	adminClient,
	apiKeyClient,
	emailOTPClient,
	inferAdditionalFields,
	jwtClient,
	lastLoginMethodClient,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { AuthInstance } from "./server";

export const authClient = createAuthClient({
	basePath: "/api/auth/v1/",
	plugins: [
		adminClient(),
		apiKeyClient(),
		jwtClient(),
		organizationClient({}),
		inferAdditionalFields<AuthInstance>({}),
		emailOTPClient(),
		lastLoginMethodClient(),
	],
});
