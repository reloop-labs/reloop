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
	const fromStyle = style.match(/max-width\s*:\s*(\d+(?:\.\d+)?)/i);
	if (fromStyle?.[1]) return Number(fromStyle[1]);
	const width = table.getAttribute("width") || "";
	if (/^\d+$/.test(width)) return Number(width);
	return null;
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
		// ~640px wrappers use align to sit on the page, not to center copy.
		if (el.tagName === "TABLE" && isColumnTable(el)) return false;
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
