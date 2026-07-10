import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { creditsConfig } from "@reloop/credits/credits.config";

type SessionUser = {
	id: string;
	role?: string | null;
	activeOrganizationId?: string | null;
};

async function fetchSession(
	cookie: string | null,
): Promise<SessionUser | null> {
	const response = await fetch(
		`${creditsConfig.BASE_URL}/api/auth/v1/get-session`,
		{
			method: "GET",
			headers: new Headers({
				"Content-Type": "application/json",
				Cookie: cookie || "",
			}),
		},
	);

	if (!response.ok) return null;

	const session = (await response.json()) as {
		user?: SessionUser;
	};

	return session?.user ?? null;
}

export async function validateSession(cookie: string | null): Promise<{
	userId: string;
	organizationId: string;
	role: string | null;
	authType: "session";
} | null> {
	const user = await fetchSession(cookie);
	if (!user?.activeOrganizationId) return null;

	return {
		userId: user.id,
		organizationId: user.activeOrganizationId,
		role: user.role ?? null,
		authType: "session",
	};
}

export async function validatePlatformAdmin(cookie: string | null): Promise<{
	userId: string;
	role: string;
	organizationId: string | null;
	authType: "session";
} | null> {
	const user = await fetchSession(cookie);
	if (!user?.id || user.role !== PLATFORM_ADMIN_ROLE) return null;

	return {
		userId: user.id,
		role: PLATFORM_ADMIN_ROLE,
		organizationId: user.activeOrganizationId ?? null,
		authType: "session",
	};
}
