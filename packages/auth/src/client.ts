import { apiKeyClient } from "@better-auth/api-key/client";
import { ac, orgRoles } from "@reloop/auth/permissions";
import { platformAc, platformRoles } from "@reloop/auth/platform-permissions";
import type { AuthInstance } from "@reloop/auth/types";
import {
	adminClient,
	emailOTPClient,
	inferAdditionalFields,
	jwtClient,
	lastLoginMethodClient,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Public site origin for Better Auth (reverse-proxied at `/api/auth/v1`).
 *
 * 1. `NEXT_PUBLIC_URL` when set (Docker build-arg / .env)
 * 2. `window.location.origin` in the browser (same-origin reverse proxy)
 *
 * Do not hardcode `local.reloop.sh` — that breaks production when the env is omitted.
 */
function resolveAuthClientBaseURL(): string {
	const fromEnv = (process.env.NEXT_PUBLIC_URL || "").trim();
	if (fromEnv) return fromEnv.replace(/\/$/, "");
	if (typeof window !== "undefined") return window.location.origin;
	return "";
}

const baseURL = resolveAuthClientBaseURL();

export const authClient = createAuthClient({
	...(baseURL ? { baseURL } : {}),
	basePath: "/api/auth/v1/",
	advanced: {
		cookiePrefix: "reloop",
	},
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
