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

/**
 * TipTap `tableCell` is `block+`, so an empty Column used as a 1px rule
 * (Twitch logo divider) is filled with a paragraph. Theme padding plus the
 * slash placeholder then open a full line of space under the logo.
 */
const COLLAPSED_EMPTY_CELL_STYLE =
	"margin:0;padding:0;line-height:0;font-size:0;height:0";

function cellHasPaintedContent(cell: HTMLElement): boolean {
	if (cell.querySelector("img, table, hr, svg, video")) return true;
	return Boolean((cell.textContent ?? "").replace(/\u00a0/g, " ").trim());
}

function isVisuallyEmptyBlock(el: Element): boolean {
	if (!(el instanceof HTMLElement)) return false;
	if (el.querySelector("img, table, hr, svg, video")) return false;
	const tag = el.tagName;
	if (tag === "BR") return true;
	if (tag === "P" || tag === "SPAN" || tag === "DIV") {
		return !(el.textContent ?? "").replace(/\u00a0/g, " ").trim();
	}
	return false;
}

export function collapseEmptyLayoutCells(root: Element): void {
	for (const cell of Array.from(root.querySelectorAll("td, th"))) {
		if (!(cell instanceof HTMLElement)) continue;
		if (cellHasPaintedContent(cell)) {
			const kids = Array.from(cell.children);
			for (let i = kids.length - 1; i >= 1; i--) {
				const kid = kids[i];
				if (!isVisuallyEmptyBlock(kid)) break;
				kid.remove();
			}
			continue;
		}
		while (cell.firstChild) cell.removeChild(cell.firstChild);
		const p = cell.ownerDocument.createElement("p");
		p.setAttribute("style", COLLAPSED_EMPTY_CELL_STYLE);
		p.setAttribute("data-empty-cell", "true");
		p.appendChild(cell.ownerDocument.createTextNode("\u200b"));
		cell.appendChild(p);
	}
}

/** Social footers (Twitch Twitter/Facebook). Larger images are content rows. */
export const SMALL_EMAIL_ICON_MAX_PX = 32;

const IMAGE_ONLY_WRAP_TAGS = new Set(["IMG", "P", "A", "SPAN", "BR"]);

export function emailImageDisplayWidth(img: HTMLImageElement): number {
	const w = img.getAttribute("width")?.trim();
	if (w && /^\d+(\.\d+)?$/.test(w)) return Number(w);
	const styleW = img.style.width?.trim();
	const px = styleW.match(/^(\d+(?:\.\d+)?)px$/i);
	if (px) return Number(px[1]);
	return Number.POSITIVE_INFINITY;
}

function imagesInImageOnlyCell(td: Element): HTMLImageElement[] | null {
	const imgs = Array.from(td.querySelectorAll("img"));
	if (imgs.length === 0) return null;
	const extra = Array.from(td.querySelectorAll("*")).filter(
		(el) => !IMAGE_ONLY_WRAP_TAGS.has(el.tagName),
	);
	if (extra.length > 0) return null;
	const text = (td.textContent ?? "").replace(/\u00a0/g, " ").trim();
	if (text.length > 0) return null;
	return imgs;
}

function soleImageInCell(td: Element): HTMLImageElement | null {
	const imgs = imagesInImageOnlyCell(td);
	return imgs?.length === 1 ? imgs[0] : null;
}

function addCssLengths(a: string, b: string): string {
	const left = a.trim();
	const right = b.trim();
	const leftOk = Boolean(left && !isZeroLength(left));
	const rightOk = Boolean(right && !isZeroLength(right));
	if (leftOk && rightOk) return `calc(${left} + ${right})`;
	if (leftOk) return left;
	if (rightOk) return right;
	return "";
}

/**
 * Footer icon gaps often live on the wrapping `<a>` (`px-2`, `pr-4`).
 * TipTap cannot keep a block image inside that link, so the padding
 * must move onto the image before the anchor is discarded.
 */
function transferAnchorBoxOntoImage(
	anchor: HTMLAnchorElement,
	img: HTMLImageElement,
): void {
	for (const side of ["left", "right"] as const) {
		const extra = addCssLengths(
			anchor.style.getPropertyValue(`margin-${side}`),
			anchor.style.getPropertyValue(`padding-${side}`),
		);
		if (!extra) continue;
		const existing = img.style.getPropertyValue(`margin-${side}`);
		img.style.setProperty(
			`margin-${side}`,
			addCssLengths(existing, extra) || extra,
		);
	}
	const display = anchor.style.display;
	if (
		(display === "inline-block" || display === "inline") &&
		!img.style.display
	) {
		img.style.display = display;
	}
}

/**
 * TipTap Image is a block atom. `<a><img></a>` inside a paragraph (or as
 * the only inline child of a cell) is invalid, so generateJSON drops the
 * image. Copy the href onto the img and unwrap the anchor.
 */
export function unwrapLinkedImages(root: Element): void {
	for (const anchor of Array.from(root.querySelectorAll("a"))) {
		if (!(anchor instanceof HTMLAnchorElement)) continue;
		const href = anchor.getAttribute("href");
		const imgs = Array.from(anchor.querySelectorAll("img"));
		if (imgs.length === 0) continue;
		const extra = Array.from(anchor.querySelectorAll("*")).filter(
			(el) => el.tagName !== "IMG",
		);
		if (extra.length > 0) continue;
		if ((anchor.textContent ?? "").replace(/\u00a0/g, " ").trim()) continue;
		for (const img of imgs) {
			if (href && !img.getAttribute("href")) img.setAttribute("href", href);
			transferAnchorBoxOntoImage(anchor, img);
		}
		const parent = anchor.parentNode;
		if (!parent) continue;
		while (anchor.firstChild) parent.insertBefore(anchor.firstChild, anchor);
		anchor.remove();
	}
}

export function isImageOnlySingleRowTable(table: HTMLTableElement): boolean {
	const rows = table.tBodies.length
		? Array.from(table.tBodies[0].rows)
		: Array.from(table.rows);
	if (rows.length !== 1) return false;
	const cells = Array.from(rows[0].cells);
	if (cells.length < 2 || cells.length > 8) return false;
	return cells.every((td) => soleImageInCell(td) !== null);
}

/**
 * React Email Img is `display:block`. TipTap also wraps the img in a
 * paragraph that EmailTheming pads by 0.5em, and canvas CSS tops the cell.
 * A 64px avatar then sits lower than the 12px arrow beside it, and block
 * images ignore td align="right"|"left" so the row looks split.
 *
 * Image-only rows stay a table: middle-align cells, inline-block images,
 * copy align onto text-align. Social-size icons keep `data-icon-row`;
 * larger avatar rows get `data-image-row` so they are not force-centered.
 */
export function alignImageOnlyTableRows(root: Element): void {
	for (const table of Array.from(root.getElementsByTagName("table"))) {
		if (!isImageOnlySingleRowTable(table)) continue;
		const row = table.tBodies.length ? table.tBodies[0].rows[0] : table.rows[0];
		const cells = Array.from(row.cells);
		const imgs = cells.map((cell) => soleImageInCell(cell));
		const allSmall = imgs.every(
			(img) =>
				img != null && emailImageDisplayWidth(img) <= SMALL_EMAIL_ICON_MAX_PX,
		);
		if (allSmall) {
			table.setAttribute("data-icon-row", "true");
			table.removeAttribute("data-image-row");
		} else {
			table.setAttribute("data-image-row", "true");
			table.removeAttribute("data-icon-row");
		}
		for (let i = 0; i < cells.length; i++) {
			const td = cells[i];
			const img = imgs[i];
			if (!img) continue;
			td.style.verticalAlign = "middle";
			const htmlAlign = td.getAttribute("align")?.toLowerCase();
			if (
				(htmlAlign === "left" ||
					htmlAlign === "right" ||
					htmlAlign === "center") &&
				!td.style.textAlign
			) {
				td.style.textAlign = htmlAlign;
			}
			img.style.display = "inline-block";
			img.style.verticalAlign = "middle";
			for (const p of Array.from(td.querySelectorAll("p"))) {
				if (p.querySelectorAll("img").length !== 1) continue;
				if ((p.textContent ?? "").trim()) continue;
				p.style.padding = "0";
				p.style.margin = "0";
				p.style.lineHeight = "0";
			}
		}
	}
}

/**
 * A cell may hold several icons (Amazon social row) while its sibling is a
 * logo. That is not a 1-image-per-cell row, so the table helper above skips
 * it. Block `Img` then ignores td text-align and the group disappears to
 * the left or stacks out of view. Inline-block + copy align onto the cell.
 */
export function alignImageOnlyCells(root: Element): void {
	for (const cell of Array.from(root.querySelectorAll("td, th"))) {
		if (!(cell instanceof HTMLElement)) continue;
		const imgs = imagesInImageOnlyCell(cell);
		if (!imgs || imgs.length === 0) continue;
		const htmlAlign = cell.getAttribute("align")?.toLowerCase();
		if (
			(htmlAlign === "left" ||
				htmlAlign === "right" ||
				htmlAlign === "center") &&
			!cell.style.textAlign
		) {
			cell.style.textAlign = htmlAlign;
		}
		for (const img of imgs) {
			img.style.display = "inline-block";
			img.style.verticalAlign = "middle";
		}
		for (const p of Array.from(cell.querySelectorAll("p"))) {
			if ((p.textContent ?? "").trim()) continue;
			if (!p.querySelector("img")) continue;
			p.style.padding = "0";
			p.style.margin = "0";
			p.style.lineHeight = "0";
		}
	}
}

type JsonNode = {
	type?: string;
	attrs?: Record<string, unknown>;
	content?: JsonNode[];
	text?: string;
};

function jsonImages(node: JsonNode): JsonNode[] {
	const out: JsonNode[] = [];
	const walk = (n: JsonNode) => {
		if (n.type === "image") out.push(n);
		for (const child of n.content ?? []) walk(child);
	};
	walk(node);
	return out;
}

function jsonHasText(node: JsonNode): boolean {
	if (node.type === "text" && Boolean(node.text?.trim())) return true;
	return (node.content ?? []).some(jsonHasText);
}

export function nodeImageDisplayWidth(
	attrs: Record<string, unknown> | undefined,
): number {
	const w = attrs?.width;
	if (typeof w === "number" && Number.isFinite(w)) return w;
	if (typeof w === "string" && /^\d+(\.\d+)?$/.test(w.trim())) return Number(w);
	const style = String(attrs?.style || "");
	const match = style.match(/width\s*:\s*(\d+(?:\.\d+)?)px/i);
	if (match) return Number(match[1]);
	return Number.POSITIVE_INFINITY;
}

function upsertInlineStyle(
	style: string,
	props: Record<string, string>,
): string {
	let next = style || "";
	for (const [prop, value] of Object.entries(props)) {
		const re = new RegExp(`${prop}\\s*:\\s*[^;]+`, "i");
		if (re.test(next)) next = next.replace(re, `${prop}:${value}`);
		else next = next ? `${next};${prop}:${value}` : `${prop}:${value}`;
	}
	return next.replace(/;{2,}/g, ";").replace(/^;|;$/g, "");
}

/**
 * TipTap wraps cell images in paragraphs after sanitize. Re-apply the same
 * image-only row rules on the document JSON (new paste and stored Yjs).
 */
export function alignImageOnlyRowsInJson(json: JsonNode): boolean {
	let changed = false;
	const walk = (node: JsonNode) => {
		if (node.type === "table" && node.content) {
			const rows = node.content.filter((child) => child.type === "tableRow");
			if (rows.length === 1) {
				const cells =
					rows[0].content?.filter(
						(child) =>
							child.type === "tableCell" || child.type === "tableHeader",
					) ?? [];
				if (cells.length >= 2 && cells.length <= 8) {
					const images = cells.map((cell) => {
						const imgs = jsonImages(cell);
						if (imgs.length !== 1) return null;
						if (jsonHasText(cell)) return null;
						return imgs[0];
					});
					if (images.every((img) => img != null)) {
						const allSmall = images.every(
							(img) =>
								nodeImageDisplayWidth(img?.attrs) <= SMALL_EMAIL_ICON_MAX_PX,
						);
						node.attrs = { ...(node.attrs ?? {}) };
						if (allSmall) {
							if (node.attrs["data-icon-row"] !== "true") {
								node.attrs["data-icon-row"] = "true";
								changed = true;
							}
							if (node.attrs["data-image-row"]) {
								delete node.attrs["data-image-row"];
								changed = true;
							}
						} else {
							if (node.attrs["data-image-row"] !== "true") {
								node.attrs["data-image-row"] = "true";
								changed = true;
							}
							if (node.attrs["data-icon-row"]) {
								delete node.attrs["data-icon-row"];
								changed = true;
							}
						}
						for (let i = 0; i < cells.length; i++) {
							const cell = cells[i];
							const img = images[i];
							if (!cell || !img) continue;
							cell.attrs = { ...(cell.attrs ?? {}) };
							const cellStyle = String(cell.attrs.style || "");
							const align = String(cell.attrs.align || "").toLowerCase();
							const cellProps: Record<string, string> = {
								"vertical-align": "middle",
							};
							if (
								(align === "left" || align === "right" || align === "center") &&
								!/text-align/i.test(cellStyle)
							) {
								cellProps["text-align"] = align;
							}
							const nextCell = upsertInlineStyle(cellStyle, cellProps);
							if (nextCell !== cellStyle) {
								cell.attrs.style = nextCell;
								changed = true;
							}
							img.attrs = { ...(img.attrs ?? {}) };
							const imgStyle = String(img.attrs.style || "");
							const nextImg = upsertInlineStyle(imgStyle, {
								display: "inline-block",
								"vertical-align": "middle",
							});
							if (nextImg !== imgStyle) {
								img.attrs.style = nextImg;
								changed = true;
							}
							for (const child of cell.content ?? []) {
								if (child.type !== "paragraph") continue;
								if (jsonImages(child).length !== 1) continue;
								if (jsonHasText(child)) continue;
								child.attrs = { ...(child.attrs ?? {}) };
								const pStyle = String(child.attrs.style || "");
								const nextP = upsertInlineStyle(pStyle, {
									"padding-top": "0",
									"padding-right": "0",
									"padding-bottom": "0",
									"padding-left": "0",
									margin: "0",
									"line-height": "0",
								});
								if (nextP !== pStyle) {
									child.attrs.style = nextP;
									changed = true;
								}
							}
						}
					}
				}
			}
		}
		for (const child of node.content ?? []) walk(child);
	};
	walk(json);
	return changed;
}

/**
 * Several icons in one cell (Amazon social row). Do not wrap them in a
 * paragraph — Image is a block atom, so setContent drops that JSON.
 * Keep them as cell children and stamp inline-block so td text-align works.
 */
export function alignImageOnlyCellsInJson(json: JsonNode): boolean {
	let changed = false;
	const walk = (node: JsonNode) => {
		if (node.type === "tableCell" || node.type === "tableHeader") {
			const content = node.content ?? [];
			const imgs = content.filter((child) => child.type === "image");
			const extras = content.filter((child) => {
				if (child.type === "image") return false;
				if (child.type === "paragraph" && !jsonHasText(child)) return false;
				return true;
			});
			if (imgs.length >= 2 && extras.length === 0) {
				const next = content.filter((child) => child.type === "image");
				if (next.length !== content.length) {
					node.content = next;
					changed = true;
				}
				for (const img of next) {
					img.attrs = { ...(img.attrs ?? {}) };
					const style = String(img.attrs.style || "");
					const nextStyle = upsertInlineStyle(style, {
						display: "inline-block",
						"vertical-align": "middle",
					});
					if (nextStyle !== style) {
						img.attrs.style = nextStyle;
						changed = true;
					}
				}
			}
		}
		for (const child of node.content ?? []) walk(child);
	};
	walk(json);
	return changed;
}
