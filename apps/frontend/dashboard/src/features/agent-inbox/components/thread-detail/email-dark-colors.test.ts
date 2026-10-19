import { describe, expect, test } from "vitest";
import {
	contrast,
	DARK_PANEL,
	darkenBackground,
	extractColorToken,
	lightenText,
	parseColor,
} from "./email-dark-colors";

describe("parseColor", () => {
	test("parses hex, rgb, hsl and named colors", () => {
		expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
		expect(parseColor("#1F2937")).toEqual({ r: 31, g: 41, b: 55 });
		expect(parseColor("rgb(31, 41, 55)")).toEqual({ r: 31, g: 41, b: 55 });
		expect(parseColor("rgba(31 41 55 / 0.5)")).toEqual({ r: 31, g: 41, b: 55 });
		expect(parseColor("hsl(0, 0%, 100%)")).toEqual({ r: 255, g: 255, b: 255 });
		expect(parseColor("White")).toEqual({ r: 255, g: 255, b: 255 });
	});

	test("treats transparent and unknown values as no color", () => {
		expect(parseColor("transparent")).toBeNull();
		expect(parseColor("rgba(0, 0, 0, 0)")).toBeNull();
		expect(parseColor("#00000000")).toBeNull();
		expect(parseColor("inherit")).toBeNull();
		expect(parseColor("")).toBeNull();
	});

	test("extracts the color from a background shorthand", () => {
		expect(extractColorToken("#ffffff url(a.png) no-repeat")).toBe("#ffffff");
		expect(extractColorToken("white none")).toBe("white");
		expect(extractColorToken("url(a.png)")).toBeNull();
	});
});

describe("darkenBackground", () => {
	test("white becomes transparent", () => {
		expect(darkenBackground({ r: 255, g: 255, b: 255 })).toBeNull();
	});

	test("light gray cards become dark gray", () => {
		const out = darkenBackground({ r: 243, g: 244, b: 246 });
		expect(out).not.toBeNull();
		expect(out?.r).toBeLessThan(40);
	});

	test("saturated brand colors and dark backgrounds are kept", () => {
		const blue = { r: 37, g: 99, b: 235 };
		const yellow = { r: 250, g: 204, b: 21 };
		const dark = { r: 17, g: 24, b: 39 };
		expect(darkenBackground(blue)).toEqual(blue);
		expect(darkenBackground(yellow)).toEqual(yellow);
		expect(darkenBackground(dark)).toEqual(dark);
	});
});

describe("lightenText", () => {
	test("dark slate text becomes readable on the dark panel", () => {
		const out = lightenText({ r: 31, g: 41, b: 55 }, DARK_PANEL);
		expect(contrast(out, DARK_PANEL)).toBeGreaterThanOrEqual(4.5);
	});

	test("dark link blue becomes readable on the dark panel", () => {
		const out = lightenText({ r: 29, g: 78, b: 216 }, DARK_PANEL);
		expect(contrast(out, DARK_PANEL)).toBeGreaterThanOrEqual(4.5);
	});

	test("text that already reads fine is unchanged", () => {
		const white = { r: 255, g: 255, b: 255 };
		expect(lightenText(white, DARK_PANEL)).toEqual(white);
	});

	test("text on a kept light background is unchanged", () => {
		const dark = { r: 17, g: 17, b: 17 };
		expect(lightenText(dark, { r: 250, g: 204, b: 21 })).toEqual(dark);
	});
});
