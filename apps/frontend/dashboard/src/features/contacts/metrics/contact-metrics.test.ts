import { describe, expect, it } from "vitest";
import {
	buildPoints,
	detectSpikes,
	percentChange,
	toCumulative,
} from "./contact-metrics";

const days = (n: number) =>
	Array.from({ length: n }, (_, i) => {
		const d = new Date(Date.UTC(2026, 9, 1 + i));
		return d.toISOString().slice(0, 10);
	});

describe("buildPoints", () => {
	it("keeps one point per day for daily granularity", () => {
		const points = buildPoints(days(3), [1, 2, 3], [0, 1, 0], "day");
		expect(points.map((p) => p.net)).toEqual([1, 1, 3]);
		expect(points[0]?.key).toBe("2026-10-01");
	});

	it("anchors weekly buckets on the latest day", () => {
		const points = buildPoints(
			days(10),
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			Array(10).fill(0),
			"week",
		);
		// 10 days → a 3-day partial bucket first, then a full 7-day bucket ending today
		expect(points.map((p) => p.subscribed)).toEqual([3, 7]);
		expect(points[1]?.key).toBe("2026-10-04");
	});
});

describe("toCumulative", () => {
	it("accumulates each series", () => {
		const points = toCumulative(
			buildPoints(days(3), [1, 2, 3], [1, 0, 1], "day"),
		);
		expect(points.map((p) => p.subscribed)).toEqual([1, 3, 6]);
		expect(points.map((p) => p.net)).toEqual([0, 2, 4]);
	});
});

describe("detectSpikes", () => {
	const sub = [2, 3, 2, 2, 30, 3, 2, 2, 3, 2];
	const points = buildPoints(days(10), sub, Array(10).fill(0), "day");

	it("flags a bucket far above the mean", () => {
		const spikes = detectSpikes(points, "medium");
		expect(spikes).toHaveLength(1);
		expect(spikes[0]).toMatchObject({ key: "2026-10-05", value: 30 });
	});

	it("returns nothing when turned off or the series is flat", () => {
		expect(detectSpikes(points, "off")).toEqual([]);
		const flat = buildPoints(days(5), [4, 4, 4, 4, 4], [0, 0, 0, 0, 0], "day");
		expect(detectSpikes(flat, "high")).toEqual([]);
	});

	it("ignores tiny bumps", () => {
		const tiny = buildPoints(
			days(8),
			[0, 0, 0, 0, 1, 0, 0, 0],
			Array(8).fill(0),
			"day",
		);
		expect(detectSpikes(tiny, "high")).toEqual([]);
	});
});

describe("percentChange", () => {
	it("handles a zero baseline", () => {
		expect(percentChange(0, 0)).toBe(0);
		expect(percentChange(5, 0)).toBeNull();
		expect(percentChange(15, 10)).toBe(50);
	});
});
