import type { SessionEvictionEvent } from "@reloop/auth/middleware/eviction/session-eviction-event";
import { extractSessionToken } from "@reloop/auth/middleware/keys";

export function evictionEventFromAuthPath(opts: {
	path: string;
	cookieHeader?: string | null;
	userId?: string | null;
}): SessionEvictionEvent | null {
	const path = opts.path;

	if (path === "/sign-out") {
		const token = extractSessionToken(opts.cookieHeader ?? null);
		if (!token) return null;
		return {
			type: "logout",
			sessionToken: token,
			userId: opts.userId ?? null,
		};
	}

	if (path === "/change-password" || path === "/reset-password") {
		if (!opts.userId) return null;
		return { type: "password-change", userId: opts.userId };
	}

	if (path === "/organization/set-active") {
		if (!opts.userId) return null;
		return { type: "organization-switch", userId: opts.userId };
	}

	return null;
}
