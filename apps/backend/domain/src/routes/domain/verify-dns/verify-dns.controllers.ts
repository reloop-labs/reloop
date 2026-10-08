import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import {
	planDomainDnsChecks,
	summarizeDnsChecks,
} from "@reloop/db/ensure-sending-domain-verified";
import * as schema from "@reloop/db/schema";
import { ensureReceivingMxRecord } from "@reloop/domain/utils/ensure-receiving-mx";
import { ensureTrackingCnameRecord } from "@reloop/domain/utils/ensure-tracking-cname";
import { DOMAIN_VERIFY_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { eq } from "drizzle-orm";

import { useLogger } from "evlog/elysia";
import {
	enqueueVerificationJob_step3,
	fetchDomain_step1,
	updateStatusToVerifying_step2,
} from "./steps";

export async function verifyDNSRecordController({
	domainId,
	organizationId,
}: {
	domainId: string;
	organizationId: string;
}) {
	const log = useLogger();
	try {
		let { domainWithRecords } = await fetchDomain_step1({
			domainId,
			organizationId,
		});

		let repaired = false;

		// Repair legacy receiving MX (wrong name/value) so verification and the
		// dashboard show the apex/@ → inbound.{HOST_DOMAIN} record users must add.
		if (domainWithRecords.isReceivingEmailEnabled) {
			await ensureReceivingMxRecord({
				domainId,
				organizationId,
				userId: domainWithRecords.userId,
				domain: domainWithRecords.domain,
			});
			repaired = true;
		}

		// Repair / create tracking CNAME for click + open tracking.
		if (
			domainWithRecords.isClickTrackingEnabled ||
			domainWithRecords.isOpenTrackingEnabled
		) {
			await ensureTrackingCnameRecord({
				domainId,
				organizationId,
				userId: domainWithRecords.userId,
				domain: domainWithRecords.domain,
				trackingSubdomain: domainWithRecords.trackingSubdomain,
			});
			repaired = true;
		}

		if (repaired) {
			({ domainWithRecords } = await fetchDomain_step1({
				domainId,
				organizationId,
			}));
		}

		await updateStatusToVerifying_step2({
			domainId,
			domain: domainWithRecords,
		});

		// Fast path: DNS is usually already propagated when the user clicks
		// verify. Check synchronously so a correct setup returns `active`
		// in ~1-2s instead of waiting for the background worker's first
		// attempt. On any miss/timeout we fall through to the queued
		// retries below without marking the domain failed.
		const fastPath = await tryFastVerify({
			domainId,
			organizationId,
			domain: domainWithRecords,
		});
		if (fastPath?.verified) {
			log.info("Domain verification completed synchronously");
			return {
				id: domainId,
				status: "active" as const,
				event: DOMAIN_VERIFY_WEBHOOK_EVENT.id,
			};
		}

		await enqueueVerificationJob_step3({
			domainId,
			organizationId,
			domainName: domainWithRecords.domain,
			previousStatus: domainWithRecords.status,
			previousUserVerifiedDomain: domainWithRecords.userVerifiedDomain,
			previousDnsStatuses: domainWithRecords.dnsRecords.map((r) => ({
				id: r.id,
				status: r.status,
			})),
		});

		log.info("Domain verification started successfully");
		return {
			id: domainId,
			status: "verifying" as const,
			event: DOMAIN_VERIFY_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Error verifying DNS records");
		throw error;
	}
}

export async function forwardDNSController({
	domainId,
	email,
	organizationId,
}: {
	domainId: string;
	email: string;
	organizationId: string;
}) {
	const log = useLogger();
	try {
		const { domainWithRecords } = await fetchDomain_step1({
			domainId,
			organizationId,
		});

		const records = (domainWithRecords.dnsRecords || []).map((r) => ({
			type: r.recordType,
			name: r.name,
			value: r.value,
			priority: r.priority ?? undefined,
			ttl: r.ttl ?? undefined,
			recordTypeName: r.recordTypeName ?? undefined,
			purpose: r.purpose ?? undefined,
		}));

		await bus.publish(BusEvent.DNS_CONFIG_REQUESTED, {
			email,
			domain: domainWithRecords.domain,
			records,
		});

		log.info(
			`Forwarded DNS configuration for ${domainWithRecords.domain} to ${email}`,
		);
		return { success: true };
	} catch (error) {
		log.error("Error forwarding DNS configuration");
		throw error;
	}
}

/**
 * Synchronous fast-path DNS check.
 *
 * Runs the same record plan as the background worker inline, guarded by an
 * overall timeout so the API never hangs on slow resolvers. Only the
 * all-pass case writes to the DB (active + DOMAIN_VERIFIED). Any
 * mismatch/timeout returns null and the caller falls through to the queued
 * retry schedule, leaving the domain in `verifying`.
 */
async function tryFastVerify({
	domainId,
	organizationId,
	domain,
}: {
	domainId: string;
	organizationId: string;
	domain: typeof schema.domain.$inferSelect & {
		dnsRecords: (typeof schema.domainDnsRecord.$inferSelect)[];
		systemVerified?: boolean;
	};
}): Promise<{ verified: true } | null> {
	const log = useLogger();
	const FAST_PATH_TIMEOUT_MS = 8_000;

	try {
		const result = await Promise.race([
			(async () => {
				const { missingConfig, checks } = planDomainDnsChecks(
					domain.dnsRecords.map((r) => ({
						id: r.id,
						recordType: r.recordType,
						value: r.value,
						fqdn: r.fqdn,
						priority: r.priority,
						purpose: r.purpose ?? "",
					})),
					{
						isSendingEmailEnabled: domain.isSendingEmailEnabled,
						isReceivingEmailEnabled: domain.isReceivingEmailEnabled,
						isClickTrackingEnabled: domain.isClickTrackingEnabled,
						isOpenTrackingEnabled: domain.isOpenTrackingEnabled,
					},
				);

				if (missingConfig.length > 0) return null;

				const outcomes = await Promise.all(
					checks.map(async (check) => ({
						id: check.id,
						label: check.label,
						outcome: await check.run(),
					})),
				);

				const summary = summarizeDnsChecks({
					missingConfig,
					results: outcomes.map(({ label, outcome }) => ({
						label,
						outcome,
					})),
				});
				if (!summary.ok) return null;

				const trackingEnabled = Boolean(
					domain.isClickTrackingEnabled || domain.isOpenTrackingEnabled,
				);
				const wasAlreadyVerified = Boolean(
					(domain as { systemVerified?: boolean }).systemVerified,
				);

				await Promise.all([
					db
						.update(schema.domain)
						.set({
							status: "active",
							systemVerified: true,
							userVerifiedDomain: true,
							lastVerifiedAt: new Date(),
							verificationFailedReason: null,
							isTrackingDomain: trackingEnabled,
						})
						.where(eq(schema.domain.id, domainId)),
					...outcomes.map((r) =>
						db
							.update(schema.domainDnsRecord)
							.set({ status: "active", verificationError: null })
							.where(eq(schema.domainDnsRecord.id, r.id)),
					),
				]);

				if (!wasAlreadyVerified) {
					await bus.publish(BusEvent.DOMAIN_VERIFIED, {
						domainId,
						domain: domain.domain,
						organizationId,
					});
				}

				return { verified: true as const };
			})(),
			new Promise<null>((resolve) =>
				setTimeout(() => resolve(null), FAST_PATH_TIMEOUT_MS),
			),
		]);
		return result;
	} catch (error) {
		log.warn(
			`Fast-path verification skipped for ${domain.domain}: ${error instanceof Error ? error.message : String(error)}`,
		);
		return null;
	}
}
