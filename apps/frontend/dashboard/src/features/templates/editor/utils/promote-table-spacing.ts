const PADDING_PROPS = [
	"padding-top",
	"padding-right",
	"padding-bottom",
	"padding-left",
] as const;

function isZeroLength(value: string): boolean {
	const v = value.trim().toLowerCase();
	return v === "" || v === "0" || v === "0px" || v === "0rem" || v === "0em";
}

/**
 * React Email puts section padding on the <table>, with the inner td at 0.
 * Email clients (and TipTap with border-collapse) ignore table padding.
 * Move it onto the cells so the canvas matches the source layout.
 */
export function promoteTableSpacingToCells(root: Element): void {
	const tables = Array.from(root.getElementsByTagName("table"));
	for (const table of tables) {
		const fromTable = PADDING_PROPS.map((prop) =>
			table.style.getPropertyValue(prop),
		);
		if (fromTable.every((value) => isZeroLength(value))) continue;

		const rows = table.tBodies.length
			? Array.from(table.tBodies[0].rows)
			: Array.from(table.rows);

		for (const row of rows) {
			for (const cell of Array.from(row.cells)) {
				for (let i = 0; i < PADDING_PROPS.length; i++) {
					const prop = PADDING_PROPS[i];
					const tableVal = fromTable[i];
					if (!tableVal || isZeroLength(tableVal)) continue;
					const cellVal = cell.style.getPropertyValue(prop);
					if (isZeroLength(cellVal)) {
						cell.style.setProperty(prop, tableVal);
					}
				}
			}
		}

		for (const prop of PADDING_PROPS) {
			table.style.setProperty(prop, "0");
		}
	}
}

const CELL_TYPOGRAPHY_PROPS = [
	"font-size",
	"font-family",
	"line-height",
	"letter-spacing",
	"font-weight",
	"color",
	"text-transform",
	"font-style",
	"max-width",
	"text-align",
] as const;

const TYPOGRAPHY_BLOCKS = new Set([
	"P",
	"H1",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6",
	"A",
	"SPAN",
	"LI",
]);

/**
 * TipTap wraps cell text in a paragraph that does not copy the td's
 * typography. Theme `font-size: 1em` then resolves against the editor root
 * instead of the cell, so a 13px / 320px footer wraps early. Copy missing
 * properties onto the blocks that will actually paint.
 */
export function promoteCellTypographyToBlocks(root: Element): void {
	const cells = Array.from(root.querySelectorAll("td, th"));
	for (const cell of cells) {
		if (!(cell instanceof HTMLElement)) continue;
		for (const child of Array.from(cell.children)) {
			if (!(child instanceof HTMLElement)) continue;
			if (!TYPOGRAPHY_BLOCKS.has(child.tagName)) continue;
			for (const prop of CELL_TYPOGRAPHY_PROPS) {
				const fromCell = cell.style.getPropertyValue(prop);
				if (!fromCell) continue;
				if (child.style.getPropertyValue(prop)) continue;
				child.style.setProperty(prop, fromCell);
			}
		}
	}
}

const INHERIT_TYPOGRAPHY_PROPS = [
	"font-size",
	"font-family",
	"line-height",
	"letter-spacing",
	"font-weight",
	"color",
	"text-transform",
	"font-style",
] as const;

function hasPaintedBackground(el: HTMLElement): boolean {
	const bg = (el.style.backgroundColor || el.getAttribute("bgcolor") || "")
		.replace(/\s/g, "")
		.toLowerCase();
	return Boolean(bg && bg !== "transparent" && bg !== "rgba(0,0,0,0)");
}

function nearestTypography(el: HTMLElement, prop: string): string {
	let parent = el.parentElement;
	while (parent) {
		const value = parent.style.getPropertyValue(prop);
		if (value) return value;
		parent = parent.parentElement;
	}
	return "";
}

/**
 * Email clients inherit wrapper TD color / size. TipTap + EmailTheming RESET
 * do not — headings become 2.25em/600 and unstyled links become #0670DB.
 * Copy missing typography onto the nodes that paint. Buttons with their own
 * fill keep their own color so a white CTA is not painted canvas-white.
 */
export function promoteInheritedTypography(root: Element): void {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = walker.currentNode;
	while (node) {
		const el = node as HTMLElement;
		if (TYPOGRAPHY_BLOCKS.has(el.tagName)) {
			for (const prop of INHERIT_TYPOGRAPHY_PROPS) {
				if (el.style.getPropertyValue(prop)) continue;
				if (prop === "color" && hasPaintedBackground(el)) continue;
				const fromAncestor = nearestTypography(el, prop);
				if (fromAncestor) el.style.setProperty(prop, fromAncestor);
			}
		}
		node = walker.nextNode();
	}
}

/**
 * Flattening an inner icon row must not invent a 2rem gap when the outer
 * wrapper table already has margin-top (Arcane footer). Keep Dither's 2rem
 * fallback when this table is the one that carried the gap.
 */
export function flattenedIconRowMarginTop(table: HTMLElement): string {
	const own = table.style.marginTop;
	if (own && !isZeroLength(own)) return own;
	const parent = table.parentElement?.closest("table");
	const parentGap = parent instanceof HTMLElement ? parent.style.marginTop : "";
	if (parentGap && !isZeroLength(parentGap)) return "0";
	return "2rem";
}

const BLOCK_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6"]);

/**
 * EmailTheming RESET paints `.node-heading { padding-top: 0.389em }` without
 * !important. Canvas CSS must not zero padding with !important — that hides
 * source heading padding. Stamp 0 only where the paste had no padding so
 * theme ems cannot invent a gap.
 */
export function stampThemeNeutralBlockPadding(root: Element): void {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = walker.currentNode;
	while (node) {
		const el = node as HTMLElement;
		if (BLOCK_TAGS.has(el.tagName)) {
			for (const prop of PADDING_PROPS) {
				if (isZeroLength(el.style.getPropertyValue(prop))) {
					el.style.setProperty(prop, "0");
				}
			}
		}
		node = walker.nextNode();
	}
}
