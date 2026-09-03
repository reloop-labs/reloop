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
	"max-width",
	"text-align",
] as const;

const TYPOGRAPHY_BLOCKS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6"]);

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
