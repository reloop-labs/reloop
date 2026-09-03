// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
	collapseEmailBreadcrumb,
	emailBreadcrumbLabel,
	visibleEmailBreadcrumbIndexes,
} from "./breadcrumb";

function path(...types: string[]): Array<{ nodeType: string; pos: number }> {
	return types.map((nodeType, pos) => ({ nodeType, pos }));
}

describe("collapseEmailBreadcrumb", () => {
	it("collapses nested 1×1 layout tables into Container / Section / Heading", () => {
		const nodes = path(
			"body",
			"container",
			"table",
			"tableRow",
			"tableCell",
			"table",
			"tableRow",
			"tableCell",
			"heading",
		);
		const singleCell = new Set([2, 5]);
		const collapsed = collapseEmailBreadcrumb(nodes, (pos) =>
			singleCell.has(pos),
		);

		expect(
			collapsed.map((item) => emailBreadcrumbLabel(item.displayType)),
		).toEqual(["Page style", "Container", "Section", "Heading"]);
		expect(collapsed.at(-2)?.source.nodeType).toBe("tableCell");
		expect(collapsed.at(-1)?.source.nodeType).toBe("heading");
	});

	it("keeps real multi-cell tables as Table / Table Cell", () => {
		const nodes = path(
			"body",
			"container",
			"table",
			"tableRow",
			"tableCell",
			"paragraph",
		);
		const collapsed = collapseEmailBreadcrumb(nodes, () => false);

		expect(
			collapsed.map((item) => emailBreadcrumbLabel(item.displayType)),
		).toEqual(["Page style", "Container", "Table", "Table Cell", "Text"]);
	});

	it("leaves an already-semantic path alone", () => {
		const nodes = path("body", "container", "section", "heading");
		const collapsed = collapseEmailBreadcrumb(nodes, () => false);

		expect(
			collapsed.map((item) => emailBreadcrumbLabel(item.displayType)),
		).toEqual(["Page style", "Container", "Section", "Heading"]);
	});
});

describe("visibleEmailBreadcrumbIndexes", () => {
	it("shows every item when the trail is short", () => {
		expect(visibleEmailBreadcrumbIndexes(4)).toEqual([0, 1, 2, 3]);
	});

	it("keeps the first and last two when the trail is long", () => {
		expect(visibleEmailBreadcrumbIndexes(6)).toEqual([0, 4, 5]);
	});

	it("does not insert a gap when all items are visible", () => {
		expect(visibleEmailBreadcrumbIndexes(4)[1]).toBe(1);
	});
});
