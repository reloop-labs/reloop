/**
 * reputation-guard.ts
 *
 * Sync enforcement for delivery-reputation auto-blocks.
 *
 * Pauses are per sending domain: the async aggregator (logs service) writes
 * an active `org_sending_block` row for the domain whose bounce/complaint
 * rate tripped. This guard runs in sendEmailController once the From domain
 * is resolved — before credits are reserved, logs, or KumoMTA — and rejects
 * sends from a paused domain with a 403 that tells the sender exactly what
 * rate tripped and how long to wait. The org's other domains keep sending.
 *
 * Fail-open on DB outages: reputation must degrade to "allow" rather than
 * taking down all mail (same contract as rate-limiter.ts).
 */

import { findDomainSendingBlock } from "@reloop/db/sender-gate";
import { createError, log } from "evlog";

function pausedError(opts: {
	domainName: string;
	reason: string;
	bounceRate: number;
	complaintRate: number;
	retryAfterSeconds: number;
}): Error {
	const pct = (r: number) => `${(r * 100).toFixed(2)}%`;
	return createError({
		status: 403,
		message: "Sending temporarily paused",
		why:
			`Sending is paused for ${opts.domainName} (${opts.reason}: ` +
			`bounce ${pct(opts.bounceRate)}, complaint ${pct(opts.complaintRate)}). ` +
			"This domain's bounce/complaint rate is above the delivery threshold and further sends would damage its reputation and the shared IPs",
		fix:
			`Wait ${opts.retryAfterSeconds}s for the cooldown to expire, clean your recipient list ` +
			"(remove hard-bouncing addresses, only email engaged opt-in contacts), then retry. " +
			"Your other domains can still send. Contact support if you need an early review",
	});
}

export async function assertReputationAllowed({
	organizationId,
	domainId,
	domainName,
}: {
	organizationId: string;
	domainId: string;
	domainName: string;
}): Promise<void> {
	// Active (unreleased, unexpired) block for this domain, or a legacy
	// org-wide one.
	try {
		const block = await findDomainSendingBlock({ organizationId, domainId });
		if (block) {
			throw pausedError({
				domainName: block.domainName ?? domainName,
				reason: block.reason,
				bounceRate: block.bounceRate,
				complaintRate: block.complaintRate,
				retryAfterSeconds: block.retryAfterSeconds,
			});
		}
	} catch (error) {
		if (error instanceof Error && "status" in error) throw error;
		log.warn({
			message: "Reputation DB check failed — failing open",
			organizationId,
			domainId,
		});
	}
}
