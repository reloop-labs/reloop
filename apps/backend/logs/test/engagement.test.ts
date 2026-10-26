import { describe, expect, test } from "bun:test";
import {
	emptyHeatmap,
	pickBestTime,
	resolveTimeZone,
} from "@reloop/logs/routes/logs/get-engagement/get-engagement.controllers";

describe("pickBestTime", () => {
	test("returns the busiest day and hour", () => {
		const heatmap = emptyHeatmap();
		heatmap[6]![9] = 40; // Sunday 9 AM
		heatmap[1]![14] = 12;
		expect(pickBestTime(heatmap, 52)).toEqual({ day: 6, hour: 9 });
	});

	test("stays quiet until there is enough data", () => {
		const heatmap = emptyHeatmap();
		heatmap[0]![8] = 5;
		expect(pickBestTime(heatmap, 5)).toBeNull();
	});
});

describe("resolveTimeZone", () => {
	test("keeps valid IANA zones and falls back to UTC", () => {
		expect(resolveTimeZone("Asia/Kolkata")).toBe("Asia/Kolkata");
		expect(resolveTimeZone("Not/AZone")).toBe("UTC");
		expect(resolveTimeZone(undefined)).toBe("UTC");
	});
});
