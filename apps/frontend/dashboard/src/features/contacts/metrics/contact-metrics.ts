export const RANGE_OPTIONS = [7, 14, 30, 90, 180] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

export type Granularity = "day" | "week";
export type MetricsView = "period" | "cumulative";
export type ChartType = "area" | "bar";
export type Series = "subscribed" | "unsubscribed" | "net";
export type SpikeSensitivity = "off" | "low" | "medium" | "high";

/** Standard deviations above the mean a bucket must reach to count as a spike. */
export const SPIKE_THRESHOLDS: Record<
	Exclude<SpikeSensitivity, "off">,
	number
> = {
	low: 3,
	medium: 2,
	high: 1.5,
};

/** Ignore tiny bumps (e.g. 0 → 1) that are statistically "spiky" but meaningless. */
const MIN_SPIKE_VALUE = 2;

export type MetricsPoint = {
	key: string;
	label: string;
	fullLabel: string;
	subscribed: number;
	unsubscribed: number;
	net: number;
};

export type Spike = {
	key: string;
	label: string;
	fullLabel: string;
	series: Exclude<Series, "net">;
	value: number;
	average: number;
	/** value ÷ average; null when the average is 0. */
	ratio: number | null;
};

const shortDate = new Intl.DateTimeFormat(undefined, {
	day: "numeric",
	month: "short",
	timeZone: "UTC",
});
const longDate = new Intl.DateTimeFormat(undefined, {
	weekday: "short",
	day: "numeric",
	month: "short",
	year: "numeric",
	timeZone: "UTC",
});

function utcDate(key: string): Date {
	return new Date(`${key}T00:00:00.000Z`);
}

/**
 * Turn the API's parallel day arrays into chart points. Weekly buckets are
 * anchored on the most recent day so the last bucket always ends today.
 */
export function buildPoints(
	dates: string[],
	subscribed: number[],
	unsubscribed: number[],
	granularity: Granularity,
): MetricsPoint[] {
	const size = granularity === "week" ? 7 : 1;
	const points: MetricsPoint[] = [];

	for (let end = dates.length; end > 0; end -= size) {
		const start = Math.max(0, end - size);
		const firstKey = dates[start];
		const lastKey = dates[end - 1];
		if (!firstKey || !lastKey) continue;

		let sub = 0;
		let unsub = 0;
		for (let i = start; i < end; i++) {
			sub += subscribed[i] ?? 0;
			unsub += unsubscribed[i] ?? 0;
		}

		const first = utcDate(firstKey);
		const last = utcDate(lastKey);
		const isRange = size > 1 && firstKey !== lastKey;
		points.unshift({
			key: firstKey,
			label: shortDate.format(first),
			fullLabel: isRange
				? `${shortDate.format(first)} – ${shortDate.format(last)}`
				: longDate.format(first),
			subscribed: sub,
			unsubscribed: unsub,
			net: sub - unsub,
		});
	}

	return points;
}

/** Running totals, so the chart shows how the audience grew across the range. */
export function toCumulative(points: MetricsPoint[]): MetricsPoint[] {
	let sub = 0;
	let unsub = 0;
	return points.map((p) => {
		sub += p.subscribed;
		unsub += p.unsubscribed;
		return { ...p, subscribed: sub, unsubscribed: unsub, net: sub - unsub };
	});
}

export function average(values: number[]): number {
	if (values.length === 0) return 0;
	return values.reduce((a, b) => a + b, 0) / values.length;
}

function standardDeviation(values: number[], mean: number): number {
	if (values.length === 0) return 0;
	const variance =
		values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
	return Math.sqrt(variance);
}

/** Buckets that sit well above their series' normal level for the range. */
export function detectSpikes(
	points: MetricsPoint[],
	sensitivity: SpikeSensitivity,
): Spike[] {
	if (sensitivity === "off" || points.length < 3) return [];
	const k = SPIKE_THRESHOLDS[sensitivity];
	const spikes: Spike[] = [];

	for (const series of ["subscribed", "unsubscribed"] as const) {
		const values = points.map((p) => p[series]);
		const mean = average(values);
		const sd = standardDeviation(values, mean);
		if (sd === 0) continue;
		const threshold = mean + k * sd;

		for (const p of points) {
			const value = p[series];
			if (value > threshold && value >= MIN_SPIKE_VALUE) {
				spikes.push({
					key: p.key,
					label: p.label,
					fullLabel: p.fullLabel,
					series,
					value,
					average: mean,
					ratio: mean > 0 ? value / mean : null,
				});
			}
		}
	}

	return spikes.sort((a, b) => b.value - a.value);
}

/** Percent change from the previous period; null when there is no baseline. */
export function percentChange(
	current: number,
	previous: number,
): number | null {
	if (previous === 0) return current === 0 ? 0 : null;
	return ((current - previous) / Math.abs(previous)) * 100;
}

export function sum(values: number[]): number {
	return values.reduce((a, b) => a + b, 0);
}
