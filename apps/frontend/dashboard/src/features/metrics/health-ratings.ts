export type HealthRating = "excellent" | "good" | "fair" | "poor";

export type HealthMetric = {
	label: string;
	count: number;
	percent: number;
	color: string;
};

export type HealthCardId = "deliverability" | "reputation" | "engagement";

export type HealthCardModel = {
	id: HealthCardId;
	title: string;
	rating: HealthRating | null;
	rows: [HealthMetric, HealthMetric];
};

export type HealthTotals = {
	sent: number;
	delivered: number;
	bounced: number;
	complaint: number;
	opened: number;
	unsubscribed: number;
};

const RATING_RANK: Record<HealthRating, number> = {
	excellent: 0,
	good: 1,
	fair: 2,
	poor: 3,
};

const METRIC_COLORS = {
	sent: "#3B82F6",
	delivered: "#10B981",
	bounced: "#EF4444",
	complaint: "#FDB022",
	opened: "#8B5CF6",
	unsubscribed: "#9CA3AF",
} as const;

export function percentOf(part: number, whole: number): number {
	if (whole <= 0) return 0;
	return (part / whole) * 100;
}

export function formatMetricPercent(value: number): string {
	if (!Number.isFinite(value) || value <= 0) return "0%";
	const rounded = Math.round(value * 100) / 100;
	if (Number.isInteger(rounded)) return `${rounded}%`;
	return `${rounded.toFixed(2)}%`;
}

export function formatMetricCount(value: number): string {
	return value.toLocaleString();
}

export function ratingLabel(rating: HealthRating | null): string {
	if (!rating) return "No data";
	return rating.charAt(0).toUpperCase() + rating.slice(1);
}

function worseRating(
	a: HealthRating | null,
	b: HealthRating | null,
): HealthRating | null {
	if (!a) return b;
	if (!b) return a;
	return RATING_RANK[a] >= RATING_RANK[b] ? a : b;
}

/** Delivery rate: Excellent ≥ 99%, Good ≥ 95%, Fair ≥ 90%, else Poor. */
export function rateDeliverability(deliveryRate: number): HealthRating {
	if (deliveryRate >= 99) return "excellent";
	if (deliveryRate >= 95) return "good";
	if (deliveryRate >= 90) return "fair";
	return "poor";
}

/** Bounce rate: Excellent < 1%, Good < 2%, Fair < 5%, else Poor. */
export function rateBounce(bounceRate: number): HealthRating {
	if (bounceRate < 1) return "excellent";
	if (bounceRate < 2) return "good";
	if (bounceRate < 5) return "fair";
	return "poor";
}

/** Complaint rate: Excellent < 0.02%, Good < 0.08%, Fair < 0.1%, else Poor. */
export function rateComplaint(complaintRate: number): HealthRating {
	if (complaintRate < 0.02) return "excellent";
	if (complaintRate < 0.08) return "good";
	if (complaintRate < 0.1) return "fair";
	return "poor";
}

/** Open rate: Excellent ≥ 25%, Good ≥ 15%, Fair ≥ 8%, else Poor. */
export function rateOpen(openRate: number): HealthRating {
	if (openRate >= 25) return "excellent";
	if (openRate >= 15) return "good";
	if (openRate >= 8) return "fair";
	return "poor";
}

/** Unsubscribe rate: Excellent < 0.2%, Good < 0.5%, Fair < 1%, else Poor. */
export function rateUnsubscribe(unsubscribeRate: number): HealthRating {
	if (unsubscribeRate < 0.2) return "excellent";
	if (unsubscribeRate < 0.5) return "good";
	if (unsubscribeRate < 1) return "fair";
	return "poor";
}

export function buildHealthCards(totals: HealthTotals): HealthCardModel[] {
	const { sent, delivered, bounced, complaint, opened, unsubscribed } = totals;
	const hasVolume = sent > 0;

	const deliveryRate = percentOf(delivered, sent);
	const bounceRate = percentOf(bounced, sent);
	const complaintRate = percentOf(complaint, sent);
	const openRate = percentOf(opened, sent);
	const unsubscribeRate = percentOf(unsubscribed, sent);

	return [
		{
			id: "deliverability",
			title: "Deliverability",
			rating: hasVolume ? rateDeliverability(deliveryRate) : null,
			rows: [
				{
					label: "Sent",
					count: sent,
					percent: hasVolume ? 100 : 0,
					color: METRIC_COLORS.sent,
				},
				{
					label: "Delivered",
					count: delivered,
					percent: deliveryRate,
					color: METRIC_COLORS.delivered,
				},
			],
		},
		{
			id: "reputation",
			title: "Reputation",
			rating: hasVolume
				? worseRating(rateBounce(bounceRate), rateComplaint(complaintRate))
				: null,
			rows: [
				{
					label: "Bounced",
					count: bounced,
					percent: bounceRate,
					color: METRIC_COLORS.bounced,
				},
				{
					label: "Complained",
					count: complaint,
					percent: complaintRate,
					color: METRIC_COLORS.complaint,
				},
			],
		},
		{
			id: "engagement",
			title: "Engagement",
			rating: hasVolume
				? worseRating(rateOpen(openRate), rateUnsubscribe(unsubscribeRate))
				: null,
			rows: [
				{
					label: "Opened",
					count: opened,
					percent: openRate,
					color: METRIC_COLORS.opened,
				},
				{
					label: "Unsubscribed",
					count: unsubscribed,
					percent: unsubscribeRate,
					color: METRIC_COLORS.unsubscribed,
				},
			],
		},
	];
}
