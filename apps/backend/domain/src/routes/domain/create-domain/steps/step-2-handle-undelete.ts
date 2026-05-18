import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
import { DOMAIN_UNDELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function handleUndelete_step2({
	deletedDomain,
	organizationId,
	domain,
	customReturnPath,
	trackingSubdomain,
	clickTracking,
	openTracking,
	tls,
	isSendingEmailEnabled,
	isReceivingEmailEnabled,
}: {
	deletedDomain: typeof schema.domain.$inferSelect | null | undefined;
	organizationId: string;
	domain: string;
	customReturnPath?: string;
	trackingSubdomain?: string;
	clickTracking?: boolean;
	openTracking?: boolean;
	tls?: "opportunistic" | "enforced";
	isSendingEmailEnabled?: boolean;
	isReceivingEmailEnabled?: boolean;
}): Promise<DomainTypes.DomainResponse | null> {
	const log = useLogger();
	const domainId = deletedDomain?.id;

	if (deletedDomain && domainId) {
		const now = new Date();
		log.info("Undeleting existing domain");

		await db
			.update(schema.domain)
			.set({
				deletedAt: null,
				updatedAt: now,
				createdAt: now,
				status: "start-verify",
				customReturnPath,
				trackingSubdomain,
				isClickTrackingEnabled: clickTracking,
				isOpenTrackingEnabled: openTracking,
				tls,
				isSendingEmailEnabled,
				isReceivingEmailEnabled,
			})
			.where(eq(schema.domain.id, domainId));

		log.info("Undeleting domain DNS records");
		await db
			.update(schema.domainDnsRecord)
			.set({
				deletedAt: null,
				updatedAt: now,
			})
			.where(eq(schema.domainDnsRecord.domainId, domainId));

		const undeletedDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
			with: {
				dnsRecords: {
					where: isNull(schema.domainDnsRecord.deletedAt),
				},
			},
		});

		if (!undeletedDomain) {
			throw DomainErrors.failedToUndelete(domain);
		}
		await bus.publish(BusEvent.DOMAIN_UNDELETED, {
			domainId,
			domain,
			organizationId,
		});

		return {
			...undeletedDomain,
			object: "domain" as const,
			event: DOMAIN_UNDELETE_WEBHOOK_EVENT.id,
		};
	}

	return null;
}
