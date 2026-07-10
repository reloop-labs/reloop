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

export type SupportSession = {
	userId: string;
	role: string;
	email: string | null;
	name: string | null;
	organizationId: string | null;
	authType: "session";
	isPlatformAdmin: boolean;
};

async function fetchSessionUser(cookie: string | null): Promise<{
	user: SessionUser | null;
	cookieNames: string[];
	sessionUrl: string;
	responseBody: unknown;
	ok: boolean;
	status: number;
	statusText: string;
}> {
	const sessionUrl = `${adminConfig.BASE_URL}/api/auth/v1/get-session`;
	const cookieNames = cookie
		? cookie
				.split(";")
				.map((part) => part.trim().split("=")[0])
				.filter((name): name is string => Boolean(name))
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

	const session = responseBody as { user?: SessionUser };

	return {
		user: session?.user ?? null,
		cookieNames,
		sessionUrl,
		responseBody,
		ok: response.ok,
		status: response.status,
		statusText: response.statusText,
	};
}

/** Any logged-in user (customer or platform admin). */
export async function validateSupportSession(
	cookie: string | null,
): Promise<SupportSession | null> {
	const result = await fetchSessionUser(cookie);

	if (!result.ok) {
		log.error({
			message: "Support session authentication failed: session endpoint error",
			sessionUrl: result.sessionUrl,
			status: result.status,
			statusText: result.statusText,
			hasCookie: Boolean(cookie),
			cookieNames: result.cookieNames,
			response: result.responseBody,
		});
		return null;
	}

	const user = result.user;
	if (!user?.id) {
		log.warn({
			message: "Support session authentication failed: no user in session",
			sessionUrl: result.sessionUrl,
			hasCookie: Boolean(cookie),
			cookieNames: result.cookieNames,
			response: result.responseBody,
		});
		return null;
	}

	const isPlatformAdmin = user.role === PLATFORM_ADMIN_ROLE;
	return {
		userId: user.id,
		role: user.role ?? "user",
		email: user.email ?? null,
		name: user.name ?? null,
		organizationId: user.activeOrganizationId ?? null,
		authType: "session",
		isPlatformAdmin,
	};
}

export async function validatePlatformAdmin(cookie: string | null): Promise<{
	userId: string;
	role: string;
	email: string | null;
	name: string | null;
	organizationId: string | null;
	authType: "session";
} | null> {
	const session = await validateSupportSession(cookie);
	if (!session) return null;

	if (!session.isPlatformAdmin) {
		log.warn({
			message: "Platform admin authentication failed: insufficient role",
			userId: session.userId,
			email: session.email,
			role: session.role,
			requiredRole: PLATFORM_ADMIN_ROLE,
		});
		return null;
	}

	return {
		userId: session.userId,
		role: PLATFORM_ADMIN_ROLE,
		email: session.email,
		name: session.name,
		organizationId: session.organizationId,
		authType: "session",
	};
}
