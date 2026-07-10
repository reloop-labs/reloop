import { adminConfig } from "@reloop/admin/admin.config";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { log } from "evlog";

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
		log.error({
			message: "Platform admin authentication failed: session endpoint error",
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
		log.warn({
			message: "Platform admin authentication failed: no user in session",
			sessionUrl,
			hasCookie: Boolean(cookie),
			cookieNames,
			sessionKeys: Object.keys(session ?? {}),
			response: responseBody,
		});
		return null;
	}

	if (user.role !== PLATFORM_ADMIN_ROLE) {
		log.warn({
			message: "Platform admin authentication failed: insufficient role",
			sessionUrl,
			userId: user.id,
			email: user.email ?? null,
			role: user.role ?? null,
			requiredRole: PLATFORM_ADMIN_ROLE,
		});
		return null;
	}
	return {
		userId: user.id,
		role: PLATFORM_ADMIN_ROLE,
		email: user.email ?? null,
		name: user.name ?? null,
		organizationId: user.activeOrganizationId ?? null,
		authType: "session",
	};
}
