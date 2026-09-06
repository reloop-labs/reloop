import type { ProviderBucket } from "./types";

/**
 * Per-provider daily ramp table. Values are max sends per (IP, provider)
 * per calendar day. Modelled on Gmail/Outlook bulk-sender guidance:
 * start tiny, double while bounce<3% and complaint<0.05%, cap out.
 */
const RAMP: number[] = [
	50, 100, 200, 400, 800, 1500, 3000, 6000, 12000, 20000, 30000, 40000, 50000,
	60000, 80000, 100000,
];

const PROVIDER_CAP: Record<ProviderBucket, number> = {
	gmail: 100000,
	outlook: 60000,
	yahoo: 50000,
	other: 100000,
};

export function quotaForDay(
	warmupDay: number,
	provider: ProviderBucket,
): number {
	const idx = Math.max(0, Math.min(warmupDay - 1, RAMP.length - 1));
	const base = RAMP[idx] ?? 50;
	return Math.min(base, PROVIDER_CAP[provider]);
}

export function quotasForDay(
	warmupDay: number,
): Record<ProviderBucket, number> {
	return {
		gmail: quotaForDay(warmupDay, "gmail"),
		outlook: quotaForDay(warmupDay, "outlook"),
		yahoo: quotaForDay(warmupDay, "yahoo"),
		other: quotaForDay(warmupDay, "other"),
	};
}

/** Whole-calendar-day difference between two dates (UTC). */
export function warmupDayFromDates(
	firstSeenAt: Date,
	now = new Date(),
): number {
	const ms = now.getTime() - firstSeenAt.getTime();
	const days = Math.floor(ms / 86_400_000);
	return Math.max(1, Math.min(days + 1, 90));
}

/** Recipient domain -> provider bucket. Unknown/small providers -> "other". */
export function bucketForAddress(email: string): ProviderBucket {
	const domain = (email.split("@")[1] ?? "").toLowerCase();
	if (domain === "gmail.com" || domain === "googlemail.com") return "gmail";
	if (
		domain === "outlook.com" ||
		domain === "hotmail.com" ||
		domain === "live.com" ||
		domain === "msn.com"
	)
		return "outlook";
	if (domain === "yahoo.com" || domain === "ymail.com" || domain === "aol.com")
		return "yahoo";
	return "other";
}

export function bucketVolumes(
	recipients: string[],
): Record<ProviderBucket, number> {
	const volumes: Record<ProviderBucket, number> = {
		gmail: 0,
		outlook: 0,
		yahoo: 0,
		other: 0,
	};
	for (const r of recipients) volumes[bucketForAddress(r)] += 1;
	return volumes;
}

/** True when any provider bucket would exceed its warmup quota. */
export function overQuota(
	volumes: Record<ProviderBucket, number>,
	sentToday: Record<ProviderBucket, number>,
	quotas: Record<ProviderBucket, number>,
): ProviderBucket[] {
	const over: ProviderBucket[] = [];
	for (const p of ["gmail", "outlook", "yahoo", "other"] as const) {
		if ((sentToday[p] ?? 0) + (volumes[p] ?? 0) > (quotas[p] ?? 0))
			over.push(p);
	}
	return over;
}
