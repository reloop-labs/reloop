/**
 * reputation.ts — pure delivery-reputation thresholds + evaluation.
 *
 * Industry-aligned defaults:
 *  - Spam complaint: warn 0.1%, block 0.3% (Gmail / Yahoo sender requirements)
 *  - Hard bounce:    warn 3%,   block 5%
 *  - Minimum volume floor (100 sent / window) so a 1-of-2 bounce (50%)
 *    never blocks a new sender.
 *
 * Pure functions only — no DB / Redis. Usable from mail (sync guard),
 * logs (async aggregator), and bun tests.
 */

export const REPUTATION_THRESHOLDS = {
	minSent: Number(process.env.REPUTATION_MIN_SENT ?? "100"),
	bounceWarnRate: Number(process.env.REPUTATION_BOUNCE_WARN ?? "0.03"),
	bounceBlockRate: Number(process.env.REPUTATION_BOUNCE_BLOCK ?? "0.05"),
	complaintWarnRate: Number(process.env.REPUTATION_COMPLAINT_WARN ?? "0.001"),
	complaintBlockRate: Number(process.env.REPUTATION_COMPLAINT_BLOCK ?? "0.003"),
} as const;

export type ReputationReason =
	| "bounce_rate"
	| "complaint_rate"
	| "duplicate_burst";

export interface ReputationCounts {
	sent: number;
	bounced: number;
	complaint: number;
}

export interface ReputationVerdict {
	blocked: boolean;
	warned: boolean;
	reason: ReputationReason | null;
	bounceRate: number;
	complaintRate: number;
}

export function reputationRates(counts: ReputationCounts): {
	bounceRate: number;
	complaintRate: number;
} {
	const sent = Math.max(counts.sent, 0);
	if (sent === 0) return { bounceRate: 0, complaintRate: 0 };
	return {
		bounceRate: counts.bounced / sent,
		complaintRate: counts.complaint / sent,
	};
}

export function evaluateReputation(
	counts: ReputationCounts,
	thresholds = REPUTATION_THRESHOLDS,
): ReputationVerdict {
	const { bounceRate, complaintRate } = reputationRates(counts);
	if (counts.sent < thresholds.minSent) {
		return {
			blocked: false,
			warned: false,
			reason: null,
			bounceRate,
			complaintRate,
		};
	}
	// Complaint signal dominates — a spam complaint harms shared IP
	// reputation far more than a bounce.
	if (complaintRate >= thresholds.complaintBlockRate) {
		return {
			blocked: true,
			warned: true,
			reason: "complaint_rate",
			bounceRate,
			complaintRate,
		};
	}
	if (bounceRate >= thresholds.bounceBlockRate) {
		return {
			blocked: true,
			warned: true,
			reason: "bounce_rate",
			bounceRate,
			complaintRate,
		};
	}
	const warned =
		complaintRate >= thresholds.complaintWarnRate ||
		bounceRate >= thresholds.bounceWarnRate;
	return {
		blocked: false,
		warned,
		reason: warned
			? complaintRate >= thresholds.complaintWarnRate
				? "complaint_rate"
				: "bounce_rate"
			: null,
		bounceRate,
		complaintRate,
	};
}

/** Escalating cooldown: 1st 1h → 2nd 24h → 3rd+ 7d (manual appeal). */
export function blockTtlSeconds(priorBlocks: number): number {
	if (priorBlocks <= 0) return 3600;
	if (priorBlocks === 1) return 86400;
	return 7 * 86400;
}
