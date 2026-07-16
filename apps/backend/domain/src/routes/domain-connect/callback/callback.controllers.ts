import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { domainConfig } from "@reloop/domain/domain.config";
import { redis } from "@reloop/domain/lib/redis";
import { verifyDNSRecordController } from "@reloop/domain/routes/domain/verify-dns/verify-dns.controllers";

const DC_NONCE_PREFIX = "dc-nonce";

export async function callbackController({
	state,
	error,
	errorDescription,
}: {
	state?: string;
	error?: string;
	errorDescription?: string;
}): Promise<{ redirectUrl: string }> {
	const log = useLogger();
	const dashboardBase = `${domainConfig.BASE_URL}/dashboard`;

	// 1. Parse state → domainId + nonce
	if (!state) {
		log.warn("Domain Connect callback received without state parameter");
		return {
			redirectUrl: `${dashboardBase}/domain?dc_status=error&dc_error=${encodeURIComponent("Invalid callback: missing state")}`,
		};
	}

	const [domainId, nonce] = state.split(":");
	if (!domainId || !nonce) {
		log.warn("Domain Connect callback received with malformed state");
		return {
			redirectUrl: `${dashboardBase}/domain?dc_status=error&dc_error=${encodeURIComponent("Invalid callback: malformed state")}`,
		};
	}

	// 2. Validate nonce from Redis (one-time use)
	const storedDomainId = await redis.get<string>(`${DC_NONCE_PREFIX}:${nonce}`);
	if (!storedDomainId || storedDomainId !== domainId) {
		log.warn(
			`Domain Connect callback nonce validation failed for domain ${domainId}`,
		);
		return {
			redirectUrl: `${dashboardBase}/domain/${domainId}?dc_status=error&dc_error=${encodeURIComponent("Invalid or expired callback. Please try again.")}`,
		};
	}

	// Delete nonce (single-use)
	await redis.delete(`${DC_NONCE_PREFIX}:${nonce}`);

	// 3. Handle error from DNS provider
	if (error) {
		if (error === "access_denied") {
			log.info(`User cancelled Domain Connect for domain ${domainId}`);
			return {
				redirectUrl: `${dashboardBase}/domain/${domainId}?dc_status=cancelled`,
			};
		}
		log.warn(
			`Domain Connect error for domain ${domainId}: ${error} - ${errorDescription}`,
		);
		return {
			redirectUrl: `${dashboardBase}/domain/${domainId}?dc_status=error&dc_error=${encodeURIComponent(errorDescription || error)}`,
		};
	}

	// 4. Look up domain to retrieve the correct organizationId
	let organizationId = "";
	try {
		const domainRecord = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				isNull(schema.domain.deletedAt),
			),
		});
		if (domainRecord) {
			organizationId = domainRecord.organizationId;
		} else {
			log.warn(`Domain record not found for verification trigger: ${domainId}`);
			return {
				redirectUrl: `${dashboardBase}/domain/${domainId}?dc_status=error&dc_error=${encodeURIComponent("Domain not found")}`,
			};
		}
	} catch (dbErr) {
		log.error(`Database error during Domain Connect callback: ${dbErr}`);
		return {
			redirectUrl: `${dashboardBase}/domain/${domainId}?dc_status=error&dc_error=${encodeURIComponent("Database error during callback processing")}`,
		};
	}

	// 5. Success — trigger DNS verification
	try {
		log.info(
			`Domain Connect success for domain ${domainId}, triggering verification`,
		);
		await verifyDNSRecordController({
			domainId,
			organizationId,
		});
	} catch (err) {
		log.warn(`Post-DC verification trigger failed for ${domainId}: ${err}`);
	}

	return {
		redirectUrl: `${dashboardBase}/domain/${domainId}?dc_status=success`,
	};
}
