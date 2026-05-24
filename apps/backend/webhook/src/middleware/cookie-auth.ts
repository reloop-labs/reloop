import { log } from "evlog";
import { webhookConfig } from "../webhook.config";

export async function validateSession(cookie: string | null) {
	log.info({
		url: `${webhookConfig.BASE_URL}/api/auth/v1/get-session`,
		message: "Validating session via Auth service",
	});
	const response = await fetch(
		`${webhookConfig.BASE_URL}/api/auth/v1/get-session`,
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
