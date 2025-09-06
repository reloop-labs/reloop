import {
	adminClient,
	apiKeyClient,
	inferAdditionalFields,
	jwtClient,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, dev, marketing } from "./permissions";
import type { AuthInstance } from "./server";

export const authClient = createAuthClient({
	basePath: "/api/auth/v1/",
	plugins: [
		adminClient(),
		apiKeyClient(),
		jwtClient(),
		organizationClient({
			ac,
			roles: {
				admin,
				dev,
				marketing,
			},
			teams: {
				enabled: true,
				defaultTeam: {
					enabled: false,
				},
			},
		}),
		inferAdditionalFields<AuthInstance>({}),
	],
});
