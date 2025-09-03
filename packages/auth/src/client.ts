import { createAuthClient } from "better-auth/client";
import {
	adminClient,
	apiKeyClient,
	jwtClient,
	organizationClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
	basePath: "/api/auth/v1/",
	plugins: [adminClient(), apiKeyClient(), jwtClient(), organizationClient()],
	additionalFields: {
		user: {
			activeOrganization: {
				type: "string",
			},
		},
	},
});
