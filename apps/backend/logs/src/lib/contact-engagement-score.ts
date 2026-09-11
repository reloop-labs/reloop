/**
 * Per-contact engagement score (0–100) used to protect sender / IP reputation.
 *
 * Mailbox providers track per-recipient engagement. Consistently mailing
 * contacts who never open (or who bounce / complain) hurts inbox placement
 * for the whole domain/IP, so this score answers: "is this contact safe and
 * valuable to keep mailing?"
 *
 * Inputs are lifetime aggregate counts for one recipient address.
 *
 * Formula (all rates are 0..1):
 * - deliveryRate = delivered / max(sent, 1)            weight 0.20
 * - openRate     = opened / max(delivered, 1)          weight 0.35
 * - ctor         = clicked / max(opened, 1)            weight 0.25
 * - ctrScaled    = min(clicked / max(delivered, 1) * 5, 1)  weight 0.20
 *   (typical CTR is ~2–5%, so x5 normalizes ~10%+ CTR to full marks)
 *
 * raw = 100 * (0.20*delivery + 0.35*open + 0.25*ctor + 0.20*ctrScaled)
 *
 * Penalties (points subtracted):
 * - bounce:    -40 * bounced / max(total, 1)
 * - failure:   -25 * failed / max(total, 1)
 * - complaint: -60 * complained / max(total, 1), plus a hard cap:
 *   any complaint caps the final score at 40 (a spam complaint is the
 *   strongest negative IP-reputation signal).
 *
 * Small-sample shrinkage: with fewer than 5 delivered emails the observed
 * score is blended toward neutral 50 so one open doesn't read as 100:
 *   final = round(50 + (clamped - 50) * min(delivered / 5, 1))
 *
 * Returns null score ("New") when nothing has been sent yet.
 */

export type EngagementRating =
	| "New"
	| "Excellent"
	| "Good"
	| "Fair"
	| "At risk"
	| "Poor";

export interface EngagementInputs {
	total: number;
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
	bounced: number;
	failed: number;
	complained: number;
}

function clamp01(n: number): number {
	if (Number.isNaN(n)) return 0;
	return Math.min(1, Math.max(0, n));
}

export function rateFor(rating: EngagementRating): string {
	return rating;
}

export function scoreContactEngagement(inputs: EngagementInputs): {
	score: number | null;
	rating: EngagementRating;
} {
	const {
		total,
		sent,
		delivered,
		opened,
		clicked,
		bounced,
		failed,
		complained,
	} = inputs;

	if (sent <= 0) return { score: null, rating: "New" };

	const safeTotal = Math.max(total, 1);
	const deliveryRate = clamp01(delivered / Math.max(sent, 1));
	const openRate = clamp01(opened / Math.max(delivered, 1));
	const ctor = opened > 0 ? clamp01(clicked / opened) : 0;
	const ctrScaled = clamp01((clicked / Math.max(delivered, 1)) * 5);

	const raw =
		100 *
		(0.2 * deliveryRate +
			0.35 * openRate +
			0.25 * ctor +
			0.2 * ctrScaled);

	const penalty =
		40 * (bounced / safeTotal) +
		25 * (failed / safeTotal) +
		60 * (complained / safeTotal);

	let value = raw - penalty;
	value = Math.min(100, Math.max(0, value));

	// Any spam complaint caps the score — IP-reputation-wise this contact
	// is currently toxic regardless of past engagement.
	if (complained > 0) value = Math.min(value, 40);

	// Shrink low-sample scores toward neutral 50.
	const confidence = Math.min(delivered / 5, 1);
	const final = Math.round(50 + (value - 50) * confidence);

	const rating: EngagementRating =
		final >= 80
			? "Excellent"
			: final >= 60
				? "Good"
				: final >= 40
					? "Fair"
					: final >= 20
						? "At risk"
						: "Poor";

	return { score: final, rating };
}
