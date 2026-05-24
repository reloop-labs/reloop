import { creditsConfig } from "@reloop/credits/credits.config";

export async function validateSession(cookie: string | null): Promise<{
	userId: string;
	activeOrganizationId: string;
	authType: "session";
} | null> {
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
		user?: {
			id: string;
			activeOrganizationId?: string;
		};
	};

	if (session?.user?.activeOrganizationId) {
		return {
			userId: session.user.id,
			activeOrganizationId: session.user.activeOrganizationId,
			authType: "session",
		};
	}

	return null;
}
