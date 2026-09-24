import { db } from "@reloop/db/client";
import { getDomainAgeDays, getDomainInitialDailyCap, getRegistrarCreationDate } from "@reloop/db/domain-age-cap";
import { utcDayStart } from "@reloop/db/reserve-send-credits";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
import { ensureTrackingCnameRecord } from "@reloop/domain/utils/ensure-tracking-cname";
import { DOMAIN_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, count, eq, gte, isNull } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function getDomainController({
	organizationId,
	domainId,
}: {
	organizationId: string;
	domainId: string;
}): Promise<DomainTypes.DomainResponse> {
	const log = useLogger();
	try {
		log.info("Fetching domain with DNS records");
		let result = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				isNull(schema.domain.deletedAt),
				eq(schema.domain.organizationId, organizationId),
			),
			with: {
				dnsRecords: {
					where: isNull(schema.domainDnsRecord.deletedAt),
				},
			},
		});

		if (!result) {
			log.warn("Domain not found");
			throw DomainErrors.domainNotFound(domainId);
		}

		// Backfill click/open tracking CNAME so Configuration and DNS Records
		// always show the record users need to add.
		if (result.isClickTrackingEnabled || result.isOpenTrackingEnabled) {
			await ensureTrackingCnameRecord({
				domainId,
				organizationId,
				userId: result.userId,
				domain: result.domain,
				trackingSubdomain: result.trackingSubdomain,
			});
			result = await db.query.domain.findFirst({
				where: and(
					eq(schema.domain.id, domainId),
					isNull(schema.domain.deletedAt),
					eq(schema.domain.organizationId, organizationId),
				),
				with: {
					dnsRecords: {
						where: isNull(schema.domainDnsRecord.deletedAt),
					},
				},
			});
			if (!result) {
				throw DomainErrors.domainNotFound(domainId);
			}
		}

		log.info("Domain fetched successfully");
		// ── Registrar age (domain age checker tool) for warmup cap ──────────
		const registrarCreatedAtStr = await getRegistrarCreationDate(result.domain);
		const ageDays = registrarCreatedAtStr
			? getDomainAgeDays(new Date(registrarCreatedAtStr), new Date())
			: getDomainAgeDays(new Date(result.createdAt), new Date());
		const dailyCap = getDomainInitialDailyCap(ageDays);
		const dayStart = utcDayStart(new Date());
		const [sentRow] = await db
			.select({ value: count() })
			.from(schema.emailLog)
			.where(and(eq(schema.emailLog.domainId, result.id), gte(schema.emailLog.createdAt, dayStart)));
		const sentToday = sentRow?.value ?? 0;
		const remaining = dailyCap === null ? null : Math.max(0, dailyCap - sentToday);
		return {
			object: "domain" as const,
			...result,
			registrarCreatedAt: registrarCreatedAtStr ? new Date(registrarCreatedAtStr) : null,
			ageDays,
			dailyCap,
			sentToday,
			remaining,
			source: registrarCreatedAtStr ? "rdap" : "reloop",
			event: DOMAIN_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Error getting domain");
		throw error;
	}
}
