import type { EgressIp, ProviderBucket } from "./types";

/** Pick the healthiest egress IP with headroom for the dominant provider. */
export function selectEgressIp(
	candidates: EgressIp[],
	dominantProvider: ProviderBucket,
	quotasByPool: Record<string, Record<ProviderBucket, number>>,
	sentByPool: Record<string, Record<ProviderBucket, number>>,
): EgressIp | null {
	const healthy = candidates.filter(
		(c) => c.health === "ready" || c.health === "warming",
	);
	if (healthy.length === 0) return null;
	let best: EgressIp | null = null;
	let bestHeadroom = Number.NEGATIVE_INFINITY;
	for (const c of healthy) {
		const quota = quotasByPool[c.pool]?.[dominantProvider] ?? 0;
		const sent = sentByPool[c.pool]?.[dominantProvider] ?? 0;
		const headroom = quota - sent + (c.health === "ready" ? 1_000_000 : 0);
		if (headroom > bestHeadroom) {
			bestHeadroom = headroom;
			best = c;
		}
	}
	return best;
}

/** Provider bucket with the largest recipient count (ties -> gmail > outlook > yahoo > other). */
export function dominantProvider(
	volumes: Record<ProviderBucket, number>,
): ProviderBucket {
	const order: ProviderBucket[] = ["gmail", "outlook", "yahoo", "other"];
	let best: ProviderBucket = "other";
	let bestN = -1;
	for (const p of order) {
		if ((volumes[p] ?? 0) > bestN) {
			bestN = volumes[p] ?? 0;
			best = p;
		}
	}
	return best;
}
