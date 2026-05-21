import { createHash } from "node:crypto";
import { templateConfig } from "@be/template/template.config";
import { redis } from "@be/template/utils/redis";

export type SessionResult = {
	userId: string;
	organizationId: string;
	authType: "auth";
};

export async function validateSession(
	cookie: string | null | undefined,
): Promise<SessionResult | null> {
	if (!cookie) return null;

	const cacheKey = `session:${createHash("sha256").update(cookie).digest("hex")}`;

	try {
		const cached = await redis.get<SessionResult>(cacheKey);
		if (cached) return cached;
	} catch {
		// Ignore redis get failure
	}

	const response = await fetch(
		`${templateConfig.BASE_URL}/api/auth/v1/get-session`,
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
		try {
			await redis.set(cacheKey, result, 30);
		} catch {
			// Ignore redis set failure
		}
		return result;
	}

	return null;
}
