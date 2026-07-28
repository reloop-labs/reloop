import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
import { DOMAIN_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

import { useLogger } from "evlog/elysia";
import { verifyDNSRecordController } from "../verify-dns/verify-dns.controllers";

export async function updateDomainController({
	domainId,
	organizationId,
	body,
}: {
	domainId: string;
	organizationId: string;
	body: DomainTypes.UpdateDomainRequest;
}): Promise<DomainTypes.DomainResponse> {
	const log = useLogger();
	try {
		log.info("Updating domain");

		const existingDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});

		if (!existingDomain) {
			log.warn("Domain not found");
			throw DomainErrors.domainNotFound(domainId);
		}

		const updateData: Partial<typeof schema.domain.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (body.sending_email !== undefined) {
			updateData.isSendingEmailEnabled = body.sending_email;
		}

		if (body.receiving_email !== undefined) {
			updateData.isReceivingEmailEnabled = body.receiving_email;
		}

		if (body.click_tracking !== undefined) {
			updateData.isClickTrackingEnabled = body.click_tracking;
		}

		if (body.open_tracking !== undefined) {
			updateData.isOpenTrackingEnabled = body.open_tracking;
		}

		if (body.tls !== undefined) {
			updateData.tls = body.tls;
		}

		await db
			.update(schema.domain)
			.set(updateData)
			.where(
				and(
					eq(schema.domain.id, domainId),
					eq(schema.domain.organizationId, organizationId),
					isNull(schema.domain.deletedAt),
				),
			);

		// If both click and open tracking are disabled, reset the CNAME record status to pending and clear errors directly
		const clickTracking =
			body.click_tracking !== undefined
				? body.click_tracking
				: existingDomain.isClickTrackingEnabled;
		const openTracking =
			body.open_tracking !== undefined
				? body.open_tracking
				: existingDomain.isOpenTrackingEnabled;

		// Re-verify when sending/receiving changes, or when tracking is newly enabled
		// (needs CNAME). Disabling tracking alone should not kick off a full verify.
		// Also skip re-verification entirely for domains that are still "pending" —
		// the user hasn't set up DNS yet, so there's nothing to verify.
		const isPending = existingDomain.status === "pending";
		const emailFeaturesChanged =
			body.sending_email !== undefined || body.receiving_email !== undefined;
		const trackingEnabled = clickTracking || openTracking;
		const trackingTurnedOn =
			(body.click_tracking === true &&
				!existingDomain.isClickTrackingEnabled) ||
			(body.open_tracking === true && !existingDomain.isOpenTrackingEnabled);
		const shouldReverify =
			!isPending &&
			(emailFeaturesChanged || (trackingEnabled && trackingTurnedOn));

		if (!clickTracking && !openTracking) {
			await db
				.update(schema.domainDnsRecord)
				.set({ status: "pending", verificationError: null })
				.where(
					and(
						eq(schema.domainDnsRecord.domainId, domainId),
						eq(schema.domainDnsRecord.recordType, "CNAME"),
					),
				);
		} else if (shouldReverify && trackingEnabled) {
			await db
				.update(schema.domainDnsRecord)
				.set({ status: "verifying" })
				.where(
					and(
						eq(schema.domainDnsRecord.domainId, domainId),
						eq(schema.domainDnsRecord.recordType, "CNAME"),
					),
				);
		}

		if (shouldReverify) {
			try {
				await verifyDNSRecordController({ domainId, organizationId });
			} catch (verifyError) {
				log.error(
					`Failed to trigger DNS verification after domain settings update: ${verifyError instanceof Error ? verifyError.message : String(verifyError)}`,
				);
			}
		}

		const updatedDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
			with: {
				dnsRecords: {
					where: isNull(schema.domainDnsRecord.deletedAt),
				},
			},
		});

		if (!updatedDomain) {
			throw DomainErrors.databaseError("Failed to update domain");
		}

		const finalDomain = {
			object: "domain" as const,
			id: updatedDomain.id,
			domain: updatedDomain.domain,
			status: updatedDomain.status,
			userVerifiedDomain: updatedDomain.userVerifiedDomain,
			systemVerified: updatedDomain.systemVerified,
			customReturnPath: updatedDomain.customReturnPath,
			trackingSubdomain: updatedDomain.trackingSubdomain,
			isClickTrackingEnabled: updatedDomain.isClickTrackingEnabled,
			isOpenTrackingEnabled: updatedDomain.isOpenTrackingEnabled,
			tls: updatedDomain.tls,
			isTrackingDomain: updatedDomain.isTrackingDomain,
			isSendingEmailEnabled: updatedDomain.isSendingEmailEnabled,
			isReceivingEmailEnabled: updatedDomain.isReceivingEmailEnabled,
			verificationFailedReason: updatedDomain.verificationFailedReason,
			lastVerifiedAt: updatedDomain.lastVerifiedAt,
			createdAt: updatedDomain.createdAt,
			updatedAt: updatedDomain.updatedAt,
			dnsRecords: updatedDomain.dnsRecords,
			event: DOMAIN_UPDATE_WEBHOOK_EVENT.id,
		};

		await bus.publish(BusEvent.DOMAIN_UPDATED, {
			domainId,
			domain: updatedDomain.domain,
			organizationId,
		});

		return finalDomain;
	} catch (error) {
		log.error("Error updating domain settings");
		throw error;
	}
}
