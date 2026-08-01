import { describe, expect, test } from "bun:test";
import * as all from "../src/index";
import type { CodeSample } from "../src/types";

const sampleExports = Object.entries(all).filter(
	([name, value]) => name.endsWith("XCodeSamples") && Array.isArray(value),
) as [string, CodeSample[]][];

describe("@reloop/code-samples shape", () => {
	test("exports at least one sample array", () => {
		expect(sampleExports.length).toBeGreaterThan(0);
	});

	for (const [name, samples] of sampleExports) {
		test(`${name} has valid samples`, () => {
			expect(samples.length).toBeGreaterThan(0);
			const ids = new Set<string>();
			for (const s of samples) {
				expect(s.id).toBeTruthy();
				expect(s.lang).toBeTruthy();
				expect(s.label).toBeTruthy();
				expect(s.source.trim().length).toBeGreaterThan(0);
				expect(ids.has(s.id)).toBe(false);
				ids.add(s.id);
			}
			expect(ids.has("curl") || ids.has("node")).toBe(true);
		});
	}
});
