import { adminConfig } from "@reloop/admin/admin.config";

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
	const response = await fetch(
		`${adminConfig.BASE_URL}/api/auth/v1/get-session`,
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

	const user = session?.user;
	if (!user?.id || user.role !== "admin") return null;

	return {
		userId: user.id,
		role: "admin",
		email: user.email ?? null,
		name: user.name ?? null,
		organizationId: user.activeOrganizationId ?? null,
		authType: "session",
	};
}
