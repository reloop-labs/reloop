import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import { assertCustomDomainQuota } from "@reloop/domain/lib/domain-quota";
import { findOrgSmtpProvider } from "@reloop/domain/lib/smtp-provider";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
import {
	receivingTurnedOff,
	resolveDomainFeatureFlags,
	sendingTurnedOff,
	shouldReverifyDomainAfterFeatureUpdate,
	trackingTurnedOff,
} from "@reloop/domain/utils/domain-feature-update";
import { ensureTrackingCnameRecord } from "@reloop/domain/utils/ensure-tracking-cname";
import { DOMAIN_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import {
	createDnsRecords_step5,
	generateDnsRecords_step3,
} from "../create-domain/steps";
import { verifyDNSRecordController } from "../verify-dns/verify-dns.controllers";

/** Domains auto-created for a relay have no DKIM/SPF/DMARC yet; add them. */
async function ensureReloopDnsRecords(args: {
	domainId: string;
	organizationId: string;
	userId: string;
	domain: string;
	trackingSubdomain: string;
}) {
	const dkim = await db.query.domainDnsRecord.findFirst({
		where: and(
			eq(schema.domainDnsRecord.domainId, args.domainId),
			eq(schema.domainDnsRecord.recordTypeName, "DKIM"),
			isNull(schema.domainDnsRecord.deletedAt),
		),
		columns: { id: true },
	});
	if (dkim) return;
	const { dnsRecords, receivingMxRecord, trackingRecord } =
		await generateDnsRecords_step3({
			domain: args.domain,
			trackingSubdomain: args.trackingSubdomain,
		});
	await createDnsRecords_step5({
		...args,
		dnsRecords,
		receivingMxRecord,
		trackingRecord,
	});
}

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

		let leavingRelay = false;
		if (body.smtp_provider_id !== undefined) {
			if (body.smtp_provider_id !== null) {
				await findOrgSmtpProvider(organizationId, body.smtp_provider_id);
				// Relay domains need no Reloop DNS — usable right away.
				updateData.status = "active";
				updateData.systemVerified = true;
				updateData.verificationFailedReason = null;
			} else if (existingDomain.smtpProviderId) {
				leavingRelay = true;
				// Direct delivery needs our DNS; re-verify below.
				updateData.status = "pending";
				updateData.systemVerified = false;
			}
			updateData.smtpProviderId = body.smtp_provider_id;
		}

		if (leavingRelay) {
			// Relay domains don't count toward the custom-domain cap; this one
			// is about to, so check the slot under the same lock.
			await db.transaction((tx) => assertCustomDomainQuota(organizationId, tx));
			await ensureReloopDnsRecords({
				domainId,
				organizationId,
				userId: existingDomain.userId,
				domain: existingDomain.domain,
				trackingSubdomain: existingDomain.trackingSubdomain,
			});
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

		const previousFlags = {
			sending: existingDomain.isSendingEmailEnabled,
			receiving: existingDomain.isReceivingEmailEnabled,
			clickTracking: existingDomain.isClickTrackingEnabled,
			openTracking: existingDomain.isOpenTrackingEnabled,
		};
		const nextFlags = resolveDomainFeatureFlags(previousFlags, {
			sending: body.sending_email,
			receiving: body.receiving_email,
			clickTracking: body.click_tracking,
			openTracking: body.open_tracking,
		});
		const trackingEnabled = nextFlags.clickTracking || nextFlags.openTracking;
		const shouldReverify =
			leavingRelay ||
			shouldReverifyDomainAfterFeatureUpdate({
				previousStatus: existingDomain.status,
				previous: previousFlags,
				next: nextFlags,
			});

		if (sendingTurnedOff(previousFlags, nextFlags)) {
			await db
				.update(schema.domainDnsRecord)
				.set({ status: "pending", verificationError: null })
				.where(
					and(
						eq(schema.domainDnsRecord.domainId, domainId),
						eq(schema.domainDnsRecord.purpose, "sending"),
						inArray(schema.domainDnsRecord.recordTypeName, ["SPF", "DMARC"]),
					),
				);
		}

		if (receivingTurnedOff(previousFlags, nextFlags)) {
			await db
				.update(schema.domainDnsRecord)
				.set({ status: "pending", verificationError: null })
				.where(
					and(
						eq(schema.domainDnsRecord.domainId, domainId),
						eq(schema.domainDnsRecord.recordType, "MX"),
						eq(schema.domainDnsRecord.purpose, "receiving"),
					),
				);
		}

		if (trackingTurnedOff(previousFlags, nextFlags)) {
			await db
				.update(schema.domainDnsRecord)
				.set({ status: "pending", verificationError: null })
				.where(
					and(
						eq(schema.domainDnsRecord.domainId, domainId),
						eq(schema.domainDnsRecord.recordType, "CNAME"),
						eq(schema.domainDnsRecord.purpose, "tracking"),
					),
				);
		} else if (trackingEnabled) {
			await ensureTrackingCnameRecord({
				domainId,
				organizationId,
				userId: existingDomain.userId,
				domain: existingDomain.domain,
				trackingSubdomain: existingDomain.trackingSubdomain,
			});
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
			smtpProviderId: updatedDomain.smtpProviderId,
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
