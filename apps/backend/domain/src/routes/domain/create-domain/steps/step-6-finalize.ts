import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
import { DOMAIN_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function finalizeDomainCreation_step6({
	domainId,
	organizationId,
	domain,
}: {
	domainId: string;
	organizationId: string;
	domain: string;
}): Promise<DomainTypes.DomainResponse> {
	const log = useLogger();
	log.info("Fetching domain with DNS records");

	const domainWithDnsRecords = await db.query.domain.findFirst({
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

	if (!domainWithDnsRecords) {
		throw DomainErrors.databaseError(
			"Failed to fetch domain with DNS records after creation",
		);
	}

	await bus.publish(BusEvent.DOMAIN_CREATED, {
		domainId,
		domain,
		organizationId,
	});

	return {
		id: domainWithDnsRecords.id,
		domain: domainWithDnsRecords.domain,
		status: domainWithDnsRecords.status,
		userVerifiedDomain: domainWithDnsRecords.userVerifiedDomain,
		systemVerified: domainWithDnsRecords.systemVerified,
		customReturnPath: domainWithDnsRecords.customReturnPath,
		trackingSubdomain: domainWithDnsRecords.trackingSubdomain,
		isClickTrackingEnabled: domainWithDnsRecords.isClickTrackingEnabled,
		isOpenTrackingEnabled: domainWithDnsRecords.isOpenTrackingEnabled,
		tls: domainWithDnsRecords.tls,
		isTrackingDomain: domainWithDnsRecords.isTrackingDomain,
		isSendingEmailEnabled: domainWithDnsRecords.isSendingEmailEnabled,
		isReceivingEmailEnabled: domainWithDnsRecords.isReceivingEmailEnabled,
		verificationFailedReason: domainWithDnsRecords.verificationFailedReason,
		lastVerifiedAt: domainWithDnsRecords.lastVerifiedAt,
		createdAt: domainWithDnsRecords.createdAt,
		updatedAt: domainWithDnsRecords.updatedAt,
		dnsRecords: domainWithDnsRecords.dnsRecords,
		object: "domain" as const,
		event: DOMAIN_CREATE_WEBHOOK_EVENT.id,
	};
}
