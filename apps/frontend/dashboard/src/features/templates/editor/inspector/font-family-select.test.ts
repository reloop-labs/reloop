import { describe, expect, it } from "vitest";
import {
	ALL_FONTS,
	getFontDisplayLabel,
	normalizeFontValue,
} from "./font-family-select";

describe("font-family-select", () => {
	it("correctly identifies Garamond without confusing it with Times New Roman fallback", () => {
		const garamondOption = ALL_FONTS.find((f) => f.family === "Garamond")!;
		expect(garamondOption).toBeDefined();

		// Garamond's full stack: "Garamond, Baskerville, 'Times New Roman', serif"
		expect(normalizeFontValue(garamondOption.value)).toBe(garamondOption.value);
		expect(getFontDisplayLabel(garamondOption.value)).toBe("Garamond");

		// Partial / simple family name
		expect(normalizeFontValue("Garamond")).toBe(garamondOption.value);
		expect(getFontDisplayLabel("Garamond")).toBe("Garamond");
		expect(normalizeFontValue("'Garamond'")).toBe(garamondOption.value);
		expect(getFontDisplayLabel("'Garamond'")).toBe("Garamond");
	});

	it("correctly identifies Times New Roman", () => {
		const timesOption = ALL_FONTS.find((f) => f.family === "Times New Roman")!;
		expect(timesOption).toBeDefined();

		expect(normalizeFontValue(timesOption.value)).toBe(timesOption.value);
		expect(getFontDisplayLabel(timesOption.value)).toBe("Times New Roman");

		expect(normalizeFontValue("Times New Roman")).toBe(timesOption.value);
		expect(getFontDisplayLabel("Times New Roman")).toBe("Times New Roman");
	});

	it("correctly distinguishes fonts with shared fallbacks like Merriweather and Georgia", () => {
		const merriweather = ALL_FONTS.find((f) => f.family === "Merriweather")!;
		const georgia = ALL_FONTS.find((f) => f.family === "Georgia")!;

		// Merriweather has Georgia and Times New Roman in its stack
		expect(normalizeFontValue(merriweather.value)).toBe(merriweather.value);
		expect(getFontDisplayLabel(merriweather.value)).toBe("Merriweather");

		expect(normalizeFontValue(georgia.value)).toBe(georgia.value);
		expect(getFontDisplayLabel(georgia.value)).toBe("Georgia");
	});

	it("handles web fonts with complex system fallback stacks like Inter and Plus Jakarta Sans", () => {
		const inter = ALL_FONTS.find((f) => f.family === "Inter")!;
		const pjs = ALL_FONTS.find((f) => f.family === "Plus Jakarta Sans")!;

		expect(normalizeFontValue(inter.value)).toBe(inter.value);
		expect(getFontDisplayLabel(inter.value)).toBe("Inter");

		expect(normalizeFontValue(pjs.value)).toBe(pjs.value);
		expect(getFontDisplayLabel(pjs.value)).toBe("Plus Jakarta Sans");
	});

	it("handles unrecognized or custom font stacks gracefully", () => {
		expect(normalizeFontValue("CustomBrandFont, sans-serif")).toBe(
			"CustomBrandFont, sans-serif",
		);
		expect(getFontDisplayLabel("CustomBrandFont, sans-serif")).toBe(
			"CustomBrandFont",
		);
		expect(getFontDisplayLabel("")).toBe("Font family");
		expect(getFontDisplayLabel(undefined)).toBe("Font family");
	});
});
