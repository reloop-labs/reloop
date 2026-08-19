import { describe, expect, it } from "vitest";
import {
	editorSlashCommands,
	groupByCategory,
	groupWidgetSections,
} from "./slash-commands";

describe("groupByCategory", () => {
	it("keeps first-seen category order and buckets items", () => {
		const groups = groupByCategory([
			{ category: "Text", title: "Title" },
			{ category: "Layout", title: "Button" },
			{ category: "Text", title: "Subtitle" },
			{ category: "Basic", title: "Variable" },
		]);

		expect(groups.map((g) => g.category)).toEqual(["Text", "Layout", "Basic"]);
		expect(groups[0]?.items.map((i) => i.title)).toEqual(["Title", "Subtitle"]);
		expect(groups[1]?.items.map((i) => i.title)).toEqual(["Button"]);
		expect(groups[2]?.items.map((i) => i.title)).toEqual(["Variable"]);
	});

	it("treats an empty category as Other", () => {
		const groups = groupByCategory([{ category: "", title: "Loose" }]);
		expect(groups).toEqual([
			{ category: "Other", items: [{ category: "", title: "Loose" }] },
		]);
	});
});

describe("editorSlashCommands", () => {
	it("mirrors the canvas slash menu, including Image and Variable", () => {
		expect(editorSlashCommands.map((item) => item.title)).toEqual(
			expect.arrayContaining([
				"Title",
				"Subtitle",
				"Heading",
				"Bullet list",
				"Button",
				"Image",
				"Variable",
			]),
		);
	});
});

describe("groupWidgetSections", () => {
	it("orders Text, Layout, Variables, Footer, then Images", () => {
		expect(groupWidgetSections().map((g) => g.category)).toEqual([
			"Text",
			"Layout",
			"Variables",
			"Footer",
			"Images",
		]);
	});

	it("moves Image out of Layout and Variable into Variables", () => {
		const groups = groupWidgetSections();
		const byCategory = Object.fromEntries(
			groups.map((g) => [g.category, g.items.map((i) => i.title)]),
		);
		expect(byCategory.Layout).not.toContain("Image");
		expect(byCategory.Images).toEqual(["Image"]);
		expect(byCategory.Variables).toEqual(["Variable"]);
		expect(byCategory.Footer).toEqual(["Footer"]);
		expect(byCategory.Text).toEqual(
			expect.arrayContaining(["Text", "Title", "Subtitle"]),
		);
	});
});
