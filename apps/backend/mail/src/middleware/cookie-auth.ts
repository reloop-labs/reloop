import { mailConfig } from "@reloop/be-mail/mail.config";

export async function validateSession(cookie: string | null) {
	if (!cookie) {
		return null;
	}

	const response = await fetch(
		`${mailConfig.BASE_URL}/api/auth/v1/get-session`,
		{
			method: "GET",
			headers: new Headers({
				"Content-Type": "application/json",
				Cookie: cookie,
			}),
		},
	);

	if (!response.ok) {
		return null;
	}

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
			authType: "session" as const,
		};
	}

	return null;
}
