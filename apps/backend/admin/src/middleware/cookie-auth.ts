import { adminConfig } from "@reloop/admin/admin.config";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";

type SessionUser = {
	id: string;
	role?: string | null;
	email?: string | null;
	name?: string | null;
	activeOrganizationId?: string | null;
};

export async function validatePlatformAdmin(cookie: string | null): Promise<{
	userId: string;
	role: string;
	email: string | null;
	name: string | null;
	organizationId: string | null;
	authType: "session";
} | null> {
	const sessionUrl = `${adminConfig.BASE_URL}/api/auth/v1/get-session`;
	const cookieNames = cookie
		? cookie
				.split(";")
				.map((part) => part.trim().split("=")[0])
				.filter(Boolean)
		: [];

	// console.* so logs show immediately in turbo/dev terminals.
	// evlog request log.info() only buffers until the response finishes.
	console.log("[admin-auth] session check started", {
		sessionUrl,
		hasCookie: Boolean(cookie),
		cookieLength: cookie?.length ?? 0,
		cookieNames,
	});

	const response = await fetch(sessionUrl, {
		method: "GET",
		headers: new Headers({
			"Content-Type": "application/json",
			Cookie: cookie || "",
		}),
	});

	const responseBody = await response.json().catch((error) => ({
		parseError:
			error instanceof Error ? error.message : "Failed to parse response",
	}));

	if (!response.ok) {
		console.error("[admin-auth] session endpoint error", {
			sessionUrl,
			status: response.status,
			statusText: response.statusText,
			hasCookie: Boolean(cookie),
			cookieNames,
			response: responseBody,
		});
		return null;
	}

	const session = responseBody as {
		user?: SessionUser;
	};

	const user = session?.user;
	if (!user?.id) {
		console.warn("[admin-auth] no user in session", {
			sessionUrl,
			hasCookie: Boolean(cookie),
			cookieNames,
			sessionKeys: Object.keys(session ?? {}),
			response: responseBody,
		});
		return null;
	}

	if (user.role !== PLATFORM_ADMIN_ROLE) {
		console.warn("[admin-auth] insufficient role", {
			sessionUrl,
			userId: user.id,
			email: user.email ?? null,
			role: user.role ?? null,
			requiredRole: PLATFORM_ADMIN_ROLE,
		});
		return null;
	}

	console.log("[admin-auth] authentication succeeded", {
		userId: user.id,
		email: user.email ?? null,
		role: user.role,
		organizationId: user.activeOrganizationId ?? null,
	});

	return {
		userId: user.id,
		role: PLATFORM_ADMIN_ROLE,
		email: user.email ?? null,
		name: user.name ?? null,
		organizationId: user.activeOrganizationId ?? null,
		authType: "session",
	};
}
