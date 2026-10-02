/**
 * reputation-guard.ts
 *
 * Sync enforcement for delivery-reputation auto-blocks.
 *
 * The async aggregator (logs service) writes active rows to
 * `org_sending_block` + a Redis fast-path key. This guard runs at the top
 * of sendEmailController — before credits, logs, or KumoMTA — and rejects
 * blocked orgs with a 403 that tells the sender exactly what rate tripped
 * and how long to wait.
 *
 * Fail-open on Redis/DB outages: reputation must degrade to "allow" rather
 * than taking down all mail (same contract as rate-limiter.ts).
 */

import { db } from "@reloop/db/client";
import { orgSendingBlock } from "@reloop/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { createError, log } from "evlog";

export const REPUTATION_REDIS_PREFIX = "block:org:";

export interface ReputationGuardDeps {
	redisGet: (key: string) => Promise<unknown>;
}

function pausedError(opts: {
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
			`Sending is paused for this organization (${opts.reason}: ` +
			`bounce ${pct(opts.bounceRate)}, complaint ${pct(opts.complaintRate)}). ` +
			"Your bounce/complaint rate is above the delivery threshold and further sends would damage shared IP reputation",
		fix:
			`Wait ${opts.retryAfterSeconds}s for the cooldown to expire, clean your recipient list ` +
			"(remove hard-bouncing addresses, only email engaged opt-in contacts), then retry. " +
			"Contact support if you need an early review",
	});
}

export async function assertReputationAllowed(
	deps: ReputationGuardDeps,
	{ organizationId }: { organizationId: string },
): Promise<void> {
	// 1. Redis fast path — written by the aggregator on block.
	try {
		const cached = await deps.redisGet(
			`${REPUTATION_REDIS_PREFIX}${organizationId}`,
		);
		if (cached && typeof cached === "object") {
			const c = cached as {
				reason?: string;
				bounceRate?: number;
				complaintRate?: number;
				retryAfterSeconds?: number;
			};
			if (c.reason) {
				throw pausedError({
					reason: c.reason,
					bounceRate: c.bounceRate ?? 0,
					complaintRate: c.complaintRate ?? 0,
					retryAfterSeconds: Math.max(c.retryAfterSeconds ?? 60, 1),
				});
			}
		}
	} catch (error) {
		if (error instanceof Error && "status" in error) throw error;
		log.warn({
			message: "Reputation Redis check failed — failing open",
			organizationId,
		});
	}

	// 2. Postgres source of truth — active (unreleased, unexpired) block.
	try {
		const rows = await db
			.select()
			.from(orgSendingBlock)
			.where(
				and(
					eq(orgSendingBlock.organizationId, organizationId),
					isNull(orgSendingBlock.releasedAt),
					gt(orgSendingBlock.expiresAt, new Date()),
				),
			)
			.limit(1);
		const block = rows[0];
		if (block) {
			const retryAfterSeconds = Math.max(
				Math.ceil((block.expiresAt.getTime() - Date.now()) / 1000),
				1,
			);
			throw pausedError({
				reason: block.reason,
				bounceRate: block.bounceRate,
				complaintRate: block.complaintRate,
				retryAfterSeconds,
			});
		}
	} catch (error) {
		if (error instanceof Error && "status" in error) throw error;
		log.warn({
			message: "Reputation DB check failed — failing open",
			organizationId,
		});
	}
}
