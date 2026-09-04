/**
 * Email HTML uses align="center" to sit a ~640px column on the page.
 * TipTap's AlignmentAttribute treats that as text-align, so every block
 * goes center. Convert *column* centering to margin:auto and drop the attr.
 * Inner tables (buttons, footer) that use align="center" to center *content*
 * must keep text-align:center — the canvas used to force those back to start.
 */
export function isEmailContainerTable(table: Element): boolean {
	const style = table.getAttribute("style") || "";
	const width = table.getAttribute("width") || "";
	return (
		table.getAttribute("data-type") === "container" ||
		table.className.includes("container") ||
		/max-width/i.test(style) ||
		/maxWidth/.test(style) ||
		(/^\d+$/.test(width) && width !== "100%")
	);
}

const EMAIL_COLUMN_MIN_PX = 560;

function parseTableMaxWidthPx(table: Element): number | null {
	const style = table.getAttribute("style") || "";
	const fromStyle = style.match(
		/max-width\s*:\s*(\d+(?:\.\d+)?)(px|em|rem|%)?/i,
	);
	if (fromStyle?.[1]) {
		const unit = (fromStyle[2] || "px").toLowerCase();
		if (unit === "%") return null;
		const n = Number(fromStyle[1]);
		if (unit === "em" || unit === "rem") return n * 16;
		return n;
	}
	const width = table.getAttribute("width") || "";
	if (/^\d+$/.test(width)) return Number(width);
	return null;
}

function isFluidWidth(value: string): boolean {
	return !value || /^100%$/i.test(value.trim());
}

/**
 * React Email Container is `width: 100%; max-width: 37.5em` (600px). Copying
 * `width: 100%` onto the editor container without max-width makes the column
 * fill the dashboard. Keep the source max-width string (em stays em).
 */
export function emailColumnMaxWidthCss(table: Element): string | null {
	const style = table.getAttribute("style") || "";
	const max = style.match(/max-width\s*:\s*([^;]+)/i);
	if (max?.[1] && !isFluidWidth(max[1])) return max[1].trim();
	const widthCss = style.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
	if (widthCss?.[1] && !isFluidWidth(widthCss[1])) return widthCss[1].trim();
	const attr = (table.getAttribute("width") || "").trim();
	if (/^\d+$/.test(attr)) return `${attr}px`;
	return null;
}

function emailColumnHeightCss(table: Element): string | null {
	const style = table.getAttribute("style") || "";
	const heightCss = style.match(/(?:^|;)\s*height\s*:\s*([^;]+)/i);
	if (
		heightCss?.[1] &&
		!isFluidWidth(heightCss[1]) &&
		!/^auto$/i.test(heightCss[1].trim())
	) {
		return heightCss[1].trim();
	}
	const attr = (table.getAttribute("height") || "").trim();
	if (/^\d+$/.test(attr)) return `${attr}px`;
	return null;
}

export function applyEmailColumnWidth(el: HTMLElement, table: Element): void {
	const maxWidth = emailColumnMaxWidthCss(table);
	el.style.removeProperty("width");
	if (maxWidth) {
		el.style.maxWidth = maxWidth;
		el.style.width = "100%";
	}
	const height = emailColumnHeightCss(table);
	el.style.removeProperty("height");
	if (height) {
		el.style.height = height;
	}
}

/** Last ~640px match is the innermost column. Ignore inner 490px heading tables. */
export function findEmailContainerTable(root: ParentNode): Element | null {
	const explicit = root.querySelector('table[data-type="container"]');
	if (explicit) return explicit;

	const tables = Array.from(root.getElementsByTagName("table"));
	let column: Element | null = null;
	let columnWidth = 0;
	for (const table of tables) {
		const maxWidth = parseTableMaxWidthPx(table);
		if (maxWidth == null || maxWidth < EMAIL_COLUMN_MIN_PX) continue;
		// Widest column wins. Ties keep the outermost so an inner card
		// with max-width ≥ 560 cannot replace the email wrapper.
		if (maxWidth > columnWidth) {
			column = table;
			columnWidth = maxWidth;
		}
	}
	if (column) return column;

	let found: Element | null = null;
	for (const table of tables) {
		if (isEmailContainerTable(table)) found = table;
	}
	return found ?? tables[0] ?? null;
}

/**
 * React Email `<Heading><Text>` emits `<h1><p>…</p></h1>`. The browser
 * closes the heading first, so the inner word ("Cubes") becomes a theme
 * paragraph on a white canvas. Turn those nested paragraphs into spans
 * before DOMParser splits them.
 */
export function liftNestedHeadingParagraphs(html: string): string {
	return html.replace(
		/<(h[1-6])(\b[^>]*)>([\s\S]*?)<\/\1>/gi,
		(_full, tag: string, attrs: string, inner: string) => {
			const lifted = inner
				.replace(/<p(\s[^>]*)?>/gi, "<span$1>")
				.replace(/<\/p>/gi, "</span>");
			return `<${tag}${attrs}>${lifted}</${tag}>`;
		},
	);
}

function isSectionLikeSibling(node: Node): boolean {
	if (node.nodeType === Node.TEXT_NODE) {
		return Boolean(node.textContent?.trim());
	}
	if (!(node instanceof Element)) return false;
	const tag = node.tagName.toLowerCase();
	return (
		tag === "table" ||
		tag === "section" ||
		tag === "img" ||
		tag === "h1" ||
		tag === "h2" ||
		tag === "h3" ||
		tag === "p" ||
		tag === "div"
	);
}

/**
 * The ~640px Container is often not the whole email. A full-bleed header
 * Section sits as a sibling above it. Taking only the container cell drops
 * that chrome. Collect sibling sections, but never other cells in the same
 * row (that would flatten a two-column grid).
 */
export function takeEmailColumnContents(
	containerTable: Element,
	contentCell: Element,
): Node[] {
	const before: Node[][] = [];
	const after: Node[][] = [];
	let current: Element | null = containerTable;
	let parent = current.parentElement;

	while (parent) {
		const tag = parent.tagName;
		if (tag === "TR" || tag === "TBODY" || tag === "THEAD" || tag === "TFOOT") {
			current = parent;
			parent = parent.parentElement;
			continue;
		}

		const kids = Array.from(parent.childNodes);
		const idx = kids.indexOf(current);
		if (
			idx >= 0 &&
			(tag === "TD" || tag === "TH" || tag === "BODY" || tag === "DIV")
		) {
			before.unshift(kids.slice(0, idx).filter(isSectionLikeSibling));
			after.push(kids.slice(idx + 1).filter(isSectionLikeSibling));
		}

		if (tag === "BODY" || tag === "HTML") break;
		current = parent;
		parent = parent.parentElement;
	}

	return [
		...before.flat(),
		...Array.from(contentCell.childNodes),
		...after.flat(),
	];
}

function isWhiteBackground(value: string): boolean {
	const v = value.replace(/\s/g, "").toLowerCase();
	return (
		v === "" ||
		v === "transparent" ||
		v === "white" ||
		v === "#fff" ||
		v === "#ffffff" ||
		v === "rgb(255,255,255)" ||
		v === "rgba(255,255,255,1)"
	);
}

/**
 * The ~640px wrapper often has no background; the first full-width child
 * table may carry the page color (section gray, cream card, etc.).
 */
export function innerFullWidthBackground(cell: Element): string {
	for (const child of Array.from(cell.children)) {
		if (!(child instanceof HTMLElement) || child.tagName !== "TABLE") {
			continue;
		}
		const bg = child.style.backgroundColor;
		if (bg && !isWhiteBackground(bg)) return bg;
	}
	return "";
}

export function stripEmailCentering(root: Element): void {
	for (const center of Array.from(root.getElementsByTagName("center"))) {
		const parent = center.parentNode;
		if (!parent) continue;
		while (center.firstChild) {
			parent.insertBefore(center.firstChild, center);
		}
		center.remove();
	}

	// Wrap lone CTA links while align="center" still marks the table. React
	// Email Row/Section always set that attr for layout, not for text.
	wrapCenteredCellLinks(root);

	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = root;
	while (node) {
		const el = node as HTMLElement;
		const preserveCenter = Boolean(
			el.closest?.('[data-preserve-center="true"]'),
		);
		const tag = el.tagName.toLowerCase();
		const alignedCenter = el.getAttribute("align")?.toLowerCase() === "center";
		const columnTable = tag === "table" && isColumnTable(el);

		if (alignedCenter) {
			if (columnTable) {
				el.style.marginLeft = el.style.marginLeft || "auto";
				el.style.marginRight = el.style.marginRight || "auto";
			} else if (tag === "td" || tag === "th") {
				// One-cell Section/Column wrappers use align for layout.
				// A two-or-more-cell row is a real Column align.
				if (rowCellCount(el) >= 2 && !el.style.textAlign) {
					el.style.textAlign = "center";
				}
			} else if (!isLayoutCenteredTable(el)) {
				// Shrink-wrapped button / footer tables: keep content centered.
				if (!el.style.textAlign) el.style.textAlign = "center";
				if (tag === "table") {
					el.style.marginLeft = el.style.marginLeft || "auto";
					el.style.marginRight = el.style.marginRight || "auto";
				}
			}
			el.removeAttribute("align");
		}

		if (el.style?.textAlign?.toLowerCase() === "center" && !preserveCenter) {
			if (columnTable) {
				el.style.removeProperty("text-align");
			} else if (!isContentTextAlign(tag)) {
				el.style.removeProperty("text-align");
			}
		}

		node = walker.nextNode();
	}
}

/** Headings, cells, and inner CTA tables keep source text-align:center. */
function isContentTextAlign(tag: string): boolean {
	return (
		tag === "p" ||
		tag === "h1" ||
		tag === "h2" ||
		tag === "h3" ||
		tag === "h4" ||
		tag === "td" ||
		tag === "th" ||
		tag === "a" ||
		tag === "span" ||
		tag === "div" ||
		tag === "table"
	);
}

function isCenteredElement(el: HTMLElement): boolean {
	if (el.style.textAlign.toLowerCase() === "center") return true;
	if (el.closest('[data-preserve-center="true"]')) return true;
	if (el.getAttribute("align")?.toLowerCase() === "center") {
		const tag = el.tagName.toLowerCase();
		// Column / full-width Section/Row use align for layout, not copy.
		if (tag === "table" && isLayoutCenteredTable(el)) return false;
		// One-cell td align is the same layout attr. A lone CTA still wraps
		// when an ancestor table is shrink-wrapped or has text-align:center.
		if ((tag === "td" || tag === "th") && rowCellCount(el) < 2) return false;
		return true;
	}
	return false;
}

function ancestorIsCentered(el: HTMLElement): boolean {
	if (isCenteredElement(el)) return true;
	let parent: HTMLElement | null = el.parentElement;
	while (parent) {
		if (isCenteredElement(parent)) return true;
		parent = parent.parentElement;
	}
	return false;
}

/**
 * TipTap wraps a lone `<a>` in a table cell as a left-aligned paragraph.
 * If the cell/table is centered, put that alignment on the paragraph.
 */
export function wrapCenteredCellLinks(root: Element): void {
	const cells = Array.from(root.querySelectorAll("td, th"));
	for (const cell of cells) {
		if (!(cell instanceof HTMLElement)) continue;
		const elements = Array.from(cell.children).filter(
			(child) => child instanceof HTMLElement,
		);
		if (elements.length !== 1 || elements[0].tagName !== "A") continue;
		const table = cell.closest("table");
		if (table instanceof HTMLElement && firstRowCellCount(table) >= 2) {
			continue;
		}
		if (!ancestorIsCentered(cell)) continue;

		const doc = cell.ownerDocument;
		const p = doc.createElement("p");
		p.setAttribute("style", "margin:0;text-align:center");
		p.appendChild(elements[0] as HTMLElement);
		cell.appendChild(p);
	}
}

/** Outer email column (~640px), not a 320px footer or 480px heading table. */
function isColumnTable(el: HTMLElement): boolean {
	const maxWidth = parseTableMaxWidthPx(el);
	if (maxWidth != null && maxWidth >= EMAIL_COLUMN_MIN_PX) return true;
	return false;
}

function firstRowCellCount(el: HTMLElement): number {
	if (!(el instanceof HTMLTableElement)) return 0;
	return el.rows[0]?.cells.length ?? 0;
}

function rowCellCount(cell: HTMLElement): number {
	const row = cell.parentElement;
	if (!(row instanceof HTMLTableRowElement)) return 0;
	return row.cells.length;
}

function isFullWidthTable(el: HTMLElement): boolean {
	const width = (el.getAttribute("width") || "").trim();
	if (width === "100%") return true;
	return el.style.width.trim() === "100%";
}

/**
 * React Email Row/Section render `<table align="center" width="100%">`.
 * That sits the table in the column; it is not text-align for cells.
 * A nested table with max-width below the column is an inner block and
 * still needs margin:auto from align=center.
 */
function isLayoutCenteredTable(el: HTMLElement): boolean {
	if (el.tagName !== "TABLE") return false;
	if (isColumnTable(el)) return true;
	if (firstRowCellCount(el) >= 2) return true;
	if (isConstrainedWidthTable(el)) return false;
	if (isFullWidthTable(el)) return true;
	return false;
}

function isConstrainedWidthTable(el: HTMLElement): boolean {
	const maxWidth = parseTableMaxWidthPx(el);
	return maxWidth != null && maxWidth < EMAIL_COLUMN_MIN_PX;
}
