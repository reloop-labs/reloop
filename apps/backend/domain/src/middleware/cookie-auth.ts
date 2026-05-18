import { createHash } from "node:crypto";
import { domainConfig } from "@reloop/domain/domain.config";
import { redis } from "@reloop/domain/utils/loader";

type SessionResult = {
	userId: string;
	organizationId: string;
	authType: "auth";
};

export async function validateSession(
	cookie: string | null,
): Promise<SessionResult | null> {
	if (!cookie) return null;

	const cacheKey = `session:${createHash("sha256").update(cookie).digest("hex")}`;

	const cached = await redis.get<SessionResult>(cacheKey);
	if (cached) return cached;

	const response = await fetch(
		`${domainConfig.BASE_URL}/api/auth/v1/get-session`,
		{
			method: "GET",
			headers: new Headers({
				"Content-Type": "application/json",
				Cookie: cookie,
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
		const result: SessionResult = {
			userId: session.user.id,
			organizationId: session.user.activeOrganizationId,
			authType: "auth" as const,
		};
		await redis.set(cacheKey, result, 30);
		return result;
	}

	return null;
}
