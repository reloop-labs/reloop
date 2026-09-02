// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
	readableTextColor,
	rewriteLowContrastInlineText,
} from "./readable-text-color";

describe("readableTextColor", () => {
	it("uses white when the canvas is dark and extracted text is black", () => {
		expect(readableTextColor("rgb(19, 19, 19)", "#000000")).toBe("#ffffff");
		expect(readableTextColor("rgb(19, 19, 19)", undefined)).toBe("#ffffff");
	});

	it("lifts muted grey that disappears on a dark canvas", () => {
		expect(readableTextColor("rgb(19, 19, 19)", "rgb(74, 74, 74)")).toBe(
			"rgb(196, 196, 196)",
		);
	});

	it("keeps already-light text on a dark canvas", () => {
		expect(readableTextColor("rgb(19, 19, 19)", "rgb(255, 255, 255)")).toBe(
			"rgb(255, 255, 255)",
		);
	});

	it("keeps muted grey on a light canvas", () => {
		expect(readableTextColor("#ffffff", "rgb(74, 74, 74)")).toBe(
			"rgb(74, 74, 74)",
		);
	});
});

describe("rewriteLowContrastInlineText", () => {
	it("rewrites dark inline paragraph color on a dark canvas", () => {
		const root = document.createElement("div");
		root.innerHTML =
			'<p style="color:rgb(74, 74, 74)">If you need help getting started</p>';
		rewriteLowContrastInlineText(root, "rgb(19, 19, 19)");
		expect((root.firstElementChild as HTMLElement).style.color).toBe(
			"rgb(196, 196, 196)",
		);
	});
});

