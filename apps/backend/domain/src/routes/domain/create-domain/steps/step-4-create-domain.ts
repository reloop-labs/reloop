import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import { getRegistrarCreationDate } from "@reloop/db/domain-age-cap";
import * as schema from "@reloop/db/schema";
import { domainConfig } from "@reloop/domain/domain.config";
import { assertCustomDomainQuota } from "@reloop/domain/lib/domain-quota";

import { useLogger } from "evlog/elysia";

export async function createDomainEntry_step4({
	userId,
	organizationId,
	domain,
	customReturnPath = domainConfig.constants.defaultCustomReturnPath,
	trackingSubdomain = domainConfig.constants.defaultTrackingSubdomain,
	clickTracking,
	openTracking,
	tls,
	isSendingEmailEnabled,
	isReceivingEmailEnabled,
}: {
	userId: string;
	organizationId: string;
	domain: string;
	customReturnPath?: string;
	trackingSubdomain?: string;
	clickTracking?: boolean;
	openTracking?: boolean;
	tls?: "opportunistic" | "enforced";
	isSendingEmailEnabled?: boolean;
	isReceivingEmailEnabled?: boolean;
}) {
	const log = useLogger();
	const domainId = `domain_${createId()}`;
	log.info("Creating domain");

	// Registrar age is captured once here (RDAP `registration` event) so the
	// send path reads the stored value instead of RDAP on every email.
	// Fail-open: creation never fails because RDAP is slow or unreachable.
	let registeredAt: Date | null = null;
	try {
		const registrarCreatedAt =
			await getRegistrarCreationDate(domain);
		if (registrarCreatedAt) registeredAt = new Date(registrarCreatedAt);
	} catch (error) {
		log.warn(
			`[DOMAIN-AGE] RDAP lookup failed for ${domain}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	await db.transaction(async (tx) => {
		await assertCustomDomainQuota(organizationId, tx);
		await tx.insert(schema.domain).values({
			id: domainId,
			userId: userId,
			organizationId,
			domain: domain,

			status: "pending",
			userVerifiedDomain: false,
			systemVerified: false,
			customReturnPath,
			trackingSubdomain,
			isClickTrackingEnabled: clickTracking,
			isOpenTrackingEnabled: openTracking,
			tls,
			isSendingEmailEnabled,
			isReceivingEmailEnabled,
			registeredAt,
			registrationAgeCheckedAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	});

	return { domainId };
}
