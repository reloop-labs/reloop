import { describe, expect, it } from "vitest";
import { clampNumber, parseNumeric } from "./scrub-field";

describe("parseNumeric", () => {
	it("reads numbers and unit strings", () => {
		expect(parseNumeric(640)).toBe(640);
		expect(parseNumeric("640px")).toBe(640);
		expect(parseNumeric("-2.5em")).toBe(-2.5);
		expect(parseNumeric("")).toBeNull();
		expect(parseNumeric(undefined)).toBeNull();
	});
});

describe("clampNumber", () => {
	it("clamps and snaps to step", () => {
		expect(clampNumber(12, 0, 64, 1)).toBe(12);
		expect(clampNumber(-4, 0, 64, 1)).toBe(0);
		expect(clampNumber(80, 0, 64, 1)).toBe(64);
		expect(clampNumber(10.4, 0, 100, 1)).toBe(10);
		expect(clampNumber(1.24, 0, 10, 0.1)).toBe(1.2);
	});
});
