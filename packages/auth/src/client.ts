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
import type { AuthInstance } from "./types";

/**
 * Public site origin for Better Auth (reverse-proxied at `/api/auth/v1`).
 *
 * 1. `VITE_PUBLIC_URL` (Vite apps / dashboard Docker build-arg)
 * 2. `NEXT_PUBLIC_URL` (Next.js apps)
 * 3. `window.location.origin` in the browser (same-origin reverse proxy)
 *
 * Do not hardcode `local.reloop.sh` — that breaks production when the env is omitted.
 */
function resolveAuthClientBaseURL(): string {
	const fromEnv = (
		process.env.VITE_PUBLIC_URL ||
		process.env.NEXT_PUBLIC_URL ||
		""
	).trim();
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
