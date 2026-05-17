export async function validateSession(cookie: string | null) {
	const response = await fetch(
		`${process.env.BASE_URL}/api/auth/v1/get-session`,
		{
			method: "GET",
			headers: new Headers({
				"Content-Type": "application/json",
				Cookie: cookie || "",
			}),
		},
	);

	const session = (await response.json()) as {
		user?: {
			id: string;
			activeOrganizationId?: string;
		};
	};

	if (session?.user?.activeOrganizationId) {
		return {
			userId: session.user.id,
			organizationId: session.user.activeOrganizationId,
			authType: "auth" as const,
		};
	}

	return null;
}
