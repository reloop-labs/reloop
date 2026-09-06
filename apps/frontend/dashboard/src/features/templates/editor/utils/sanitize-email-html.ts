import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import {
	absolutizeEmailAssetUrls,
	inlineEmailStylesheet,
} from "#/features/templates/editor/utils/inline-email-stylesheet";
import {
	preserveEmailLinkUnderlines,
	stampFilledLinksAsEmailButtons,
} from "#/features/templates/editor/utils/preserve-email-link-underlines";
import {
	alignImageOnlyCells,
	alignImageOnlyTableRows,
	collapseEmptyLayoutCells,
	isImageOnlySingleRowTable,
	promoteCellTypographyToBlocks,
	promoteInheritedTypography,
	promoteTableSpacingToCells,
	stampThemeNeutralBlockPadding,
	unwrapLinkedImages,
} from "#/features/templates/editor/utils/promote-table-spacing";
import {
	emailHasMixedBackgrounds,
	rewriteLowContrastInlineText,
} from "#/features/templates/editor/utils/readable-text-color";
import {
	applyEmailColumnWidth,
	findEmailContainerTable,
	prepareEmailHtmlForParse,
	stripEmailCentering,
} from "#/features/templates/editor/utils/strip-email-centering";

/** Tags that must never appear in the editor content. */
const FORBIDDEN_TAGS = new Set([
	"script",
	"iframe",
	"object",
	"embed",
	"meta",
	"base",
	"style",
	"link",
]);

/**
 * Shared email-HTML cleanup used by Templates paste, the code editor, and
 * (later) the public HTML tool. Mirrors what `@react-email/editor`'s paste
 * handler (`sanitizePastedHtml`) does before calling `generateJSON`:
 *
 *  1. Parse the raw string (handles `<!DOCTYPE>`, `<html>`, `<head>` scaffolding).
 *  2. Drop forbidden/dangerous tags (script, iframe, style, …).
 *  3. Strip email layout centering (<center>, align="center", text-align:center)
 *     so that ProseMirror/TipTap doesn't inherit center-alignment from the
 *     outer email scaffold tables and wrapper elements.
 *  4. Expand CSS shorthand properties (padding, margin, border-radius, border)
 *     into longhand equivalents so the editor's inspector can read per-side
 *     values (paddingTop, borderRadius, etc.) via parseCssValue.
 *  5. Return `body.innerHTML` so `generateJSON` receives clean inner HTML.
 *
 * We do NOT strip tables, divs, or any structural elements — the editor's
 * own `parseHTML()` rules (container, section, button, image, link, …) are
 * responsible for mapping them to the correct TipTap node types.
 */
export function sanitizeEmailHtml(rawHtml: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(
		prepareEmailHtmlForParse(rawHtml),
		"text/html",
	);

	// Copy class-based padding/margin onto inline styles before we drop <style>
	// and unwrap the container table. Otherwise TipTap keeps the class names
	// but the heading sits flush to the canvas.
	inlineEmailStylesheet(doc);

	expandShorthandStyles(doc.body);
	promoteTableSpacingToCells(doc.body);

	// 1. Extract and clean preview text
	let previewText = "";
	const divs = Array.from(doc.querySelectorAll("div"));
	for (const div of divs) {
		const style = div.getAttribute("style") || "";
		const hasHiddenStyle =
			style.includes("display:none") ||
			style.includes("display: none") ||
			(style.includes("opacity:0") && style.includes("max-height:0")) ||
			div.getAttribute("data-skip-in-text") === "true";

		if (hasHiddenStyle) {
			const rawText = div.textContent || "";
			const cleaned = rawText.replace(/\u00a0/g, "").trim();
			if (cleaned) {
				previewText = cleaned;
				// Remove the preview div so it's not parsed as editor content
				div.remove();
				break;
			}
		}
	}

	// 2. Extract title/subject
	const titleEl = doc.querySelector("title");
	const subject = titleEl ? titleEl.textContent?.trim() : "";

	// 3. Update global editor store with extracted values
	if (previewText) {
		useEditorStore.getState().setPreviewText(previewText);
	}
	if (subject) {
		useEditorStore.getState().setSubject(subject);
	} else if (previewText) {
		useEditorStore.getState().setSubject(previewText);
	}

	// 4. Find the innermost ~640px column and convert only that wrapper to a
	// container div. Inner 1×1 padded tables stay as tables so TipTap slash /
	// bubble / inspector see Layout Table → Table Cell, like Resend.
	const containerTable = findEmailContainerTable(doc.body);

	if (containerTable) {
		// Find the innermost cell of this container table that holds the content
		const contentCell =
			containerTable.querySelector("tbody > tr > td") ||
			containerTable.querySelector("tr > td") ||
			containerTable.querySelector("td");

		if (contentCell) {
			// Create a standard container div that TipTap schema matches perfectly
			const containerDiv = doc.createElement("div");
			containerDiv.setAttribute("data-type", "container");
			containerDiv.setAttribute("class", "node-container");

			// Merge styles from containerTable and contentCell
			const scratch = doc.createElement("div") as HTMLDivElement;
			scratch.style.cssText = containerTable.getAttribute("style") || "";

			// Do not copy width="100%" / height="100%" — a div treats those
			// as stretch-to-canvas. Keep node-container even when the table
			// already has a class (glow, Tailwind utilities).
			const tableClass = containerTable.getAttribute("class");
			containerDiv.setAttribute(
				"class",
				["node-container", tableClass].filter(Boolean).join(" "),
			);
			const tableId = containerTable.getAttribute("id");
			if (tableId) containerDiv.setAttribute("id", tableId);

			// Merge contentCell style (like padding)
			const cellStyleText = contentCell.getAttribute("style") || "";
			if (cellStyleText) {
				const cellScratch = doc.createElement("div") as HTMLDivElement;
				cellScratch.style.cssText = cellStyleText;
				for (let i = 0; i < cellScratch.style.length; i++) {
					const prop = cellScratch.style[i];
					if (
						!prop ||
						prop.startsWith("background") ||
						prop === "width" ||
						prop === "height"
					)
						continue;
					const val = cellScratch.style.getPropertyValue(prop);
					if (val) {
						scratch.style.setProperty(prop, val);
					}
				}
			}

			// Carry wrapper TD typography styles onto the container div.
			// React Email templates set base typography (font-family, font-size,
			// line-height, letter-spacing, font-weight, color) on an outer <td>
			// that wraps the container table. When we extract only the container,
			// these inherited styles are lost. Merge them in so the editor canvas
			// preserves the original typography context.
			const wrapperTd =
				containerTable.closest("td") ||
				doc.querySelector('td[style*="font-family"]') ||
				doc.querySelector('td[style*="font-size"]');
			if (wrapperTd && wrapperTd !== contentCell) {
				const wrapperScratch = doc.createElement("div") as HTMLDivElement;
				wrapperScratch.style.cssText = wrapperTd.getAttribute("style") || "";
				const TYPOGRAPHY_PROPS = [
					"font-family",
					"font-size",
					"line-height",
					"letter-spacing",
				];
				for (const prop of TYPOGRAPHY_PROPS) {
					const val = wrapperScratch.style.getPropertyValue(prop);
					if (val && !scratch.style.getPropertyValue(prop)) {
						scratch.style.setProperty(prop, val);
					}
				}
			}

			// Preserve the card's own background (white vs body gray). Previously
			// background was skipped and relied solely on globalContent theming;
			// if that theming is not yet hydrated the container renders transparent
			// and the body gray bleeds through the whole canvas.
			const tableBg =
				(containerTable as HTMLElement).style.backgroundColor ||
				containerTable.getAttribute("bgcolor") ||
				"";
			if (tableBg) {
				const bgScratch = doc.createElement("div") as HTMLDivElement;
				bgScratch.style.backgroundColor = tableBg;
				const normalized = bgScratch.style.backgroundColor;
				if (normalized) scratch.style.backgroundColor = normalized;
			}
			const tableBgImage = (containerTable as HTMLElement).style
				.backgroundImage;
			if (tableBgImage) scratch.style.backgroundImage = tableBgImage;

			applyEmailColumnWidth(scratch, containerTable);

			const mergedStyle = scratch.style.cssText;
			if (mergedStyle) {
				containerDiv.setAttribute("style", mergedStyle);
			}

			// Sibling Sections (full-bleed header, footer) must stay *outside*
			// the white card so they keep the body background (gray) vs card
			// background (white). Previously they were merged inside the card,
			// which painted the Twitch footer white and made the whole canvas
			// look gray-on-white vs the HTML preview's white-card-on-gray.
			const isSectionLikeSiblingLocal = (node: Node): boolean => {
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
			};

			const siblingBefore: Node[] = [];
			const siblingAfter: Node[] = [];
			{
				let cur: Element | null = containerTable;
				let par: Element | null = cur.parentElement;
				while (par) {
					const tag = par.tagName;
					if (
						tag === "TR" ||
						tag === "TBODY" ||
						tag === "THEAD" ||
						tag === "TFOOT"
					) {
						cur = par;
						par = par.parentElement;
						continue;
					}
					const kids = Array.from(par.childNodes);
					const idx = kids.indexOf(cur);
					if (
						idx >= 0 &&
						(tag === "TD" || tag === "TH" || tag === "BODY" || tag === "DIV")
					) {
						const before = kids.slice(0, idx).filter(isSectionLikeSiblingLocal);
						const after = kids.slice(idx + 1).filter(isSectionLikeSiblingLocal);
						siblingBefore.unshift(...before);
						siblingAfter.push(...after);
					}
					if (tag === "BODY" || tag === "HTML") break;
					cur = par;
					par = par.parentElement;
				}
			}

			// Only the container cell's children go inside the white card.
			for (const node of Array.from(contentCell.childNodes)) {
				containerDiv.appendChild(node);
			}

			// Keep sibling chrome outside the card so their background stays
			// body-driven (Twitch footer on gray). Rebuild body as
			// before + card + after.
			doc.body.innerHTML = "";
			for (const n of siblingBefore) doc.body.appendChild(n);
			doc.body.appendChild(containerDiv);
			for (const n of siblingAfter) doc.body.appendChild(n);

			// Container parseHTML also matches inner max-width presentation tables.
			// Drop role=presentation so they stay TipTap tables (Resend Layout Table).
			for (const table of Array.from(doc.body.querySelectorAll("table"))) {
				if (table.getAttribute("role") === "presentation") {
					table.removeAttribute("role");
				}
			}
		}
	} else {
		// If there are no tables at all, check if we need to wrap the body in a container div
		const existingContainer = doc.querySelector('div[data-type="container"]');
		if (!existingContainer) {
			const containerDiv = doc.createElement("div");
			containerDiv.setAttribute("data-type", "container");
			containerDiv.setAttribute("class", "node-container");

			// Move all body children to the container div
			const bodyNodes = Array.from(doc.body.childNodes);
			for (const node of bodyNodes) {
				containerDiv.appendChild(node);
			}
			doc.body.appendChild(containerDiv);
		}
	}

	// React Email uses `data-id="__react-email-column"` to mark responsive columns.
	// The editor parses those into a Columns node. For icon-only rows (social footer),
	// we want them to remain a tight, left-aligned table row, so strip the marker
	// BEFORE we convert/unwrap tables below.
	stripReactEmailColumnMarkersForIconRows(doc.body);
	replaceSocialIconTablesWithInlineRow(doc.body);

	// Keep layout / spacer tables as tables so the inspector can show
	// Table Cell and slash/bubble operate on the same nodes as Resend.

	// 5. Remove dangerous elements
	for (const tag of FORBIDDEN_TAGS) {
		for (const el of Array.from(doc.body.getElementsByTagName(tag))) {
			el.remove();
		}
	}

	// 6. Strip email-layout centering so TipTap doesn't inherit center-alignment
	// from the outer scaffold. Email HTML typically centers content via:
	//   <center>…</center>
	//   <table align="center">…</table>
	//   style="text-align: center" on wrapper elements
	unwrapLinkedImages(doc.body);
	stripEmailCentering(doc.body);

	preserveEmailLinkUnderlines(doc.body);
	stampFilledLinksAsEmailButtons(doc.body);

	// 7. Expand CSS shorthand properties (padding, margin, border, border-radius)
	// into their individual longhand equivalents. Email HTML often uses
	// `padding: 10px 20px` etc., but the editor's inspector reads per-side
	// values (paddingTop, paddingRight, …) via parseCssValue. The browser
	// CSSOM expands shorthands automatically when we set cssText, so we use
	// that to produce explicit longhands on every element.
	expandShorthandStyles(doc.body);

	absolutizeEmailAssetUrls(doc);

	let canvasBg =
		doc.body.style.backgroundColor || doc.body.getAttribute("bgcolor") || "";
	if (!canvasBg) {
		for (const table of Array.from(doc.querySelectorAll("table"))) {
			const bg =
				(table as HTMLElement).style.backgroundColor ||
				table.getAttribute("bgcolor") ||
				"";
			if (bg) {
				canvasBg = bg;
				break;
			}
		}
	}
	if (canvasBg && !emailHasMixedBackgrounds(doc.body)) {
		rewriteLowContrastInlineText(doc.body, canvasBg);
	}

	promoteTableSpacingToCells(doc.body);
	promoteCellTypographyToBlocks(doc.body);
	promoteInheritedTypography(doc.body);
	stampThemeNeutralBlockPadding(doc.body);
	alignImageOnlyTableRows(doc.body);
	alignImageOnlyCells(doc.body);
	collapseEmptyLayoutCells(doc.body);

	return doc.body.innerHTML;
}

function stripReactEmailColumnMarkersForIconRows(root: Element): void {
	const candidateTables = Array.from(
		root.querySelectorAll('table td[data-id="__react-email-column"]'),
	)
		.map((td) => td.closest("table"))
		.filter(Boolean) as HTMLTableElement[];

	const uniqueTables = Array.from(new Set(candidateTables));

	for (const table of uniqueTables) {
		// Only consider "simple rows": exactly one row, and all direct cells are marked columns.
		const directRow =
			table.querySelector(":scope > tbody > tr") ||
			table.querySelector(":scope > tr");
		if (!directRow) continue;

		const directCells = Array.from(directRow.querySelectorAll(":scope > td"));
		if (directCells.length < 2) continue;
		if (
			!directCells.every(
				(td) => td.getAttribute("data-id") === "__react-email-column",
			)
		) {
			continue;
		}

		// Image-only rows (avatars or social icons) must stay tables. The
		// Columns node spreads a 64px | 12px | 64px row and ignores td align.
		if (!isImageOnlySingleRowTable(table)) continue;

		for (const td of directCells) {
			td.removeAttribute("data-id");
		}
	}
}

/**
 * TipTap's schema tends to treat "multiple <td> in one row" as Columns-like layout,
 * which spreads icons across the whole width in the visual editor.
 *
 * For the common "social icons" footer pattern, replace the table with a simple
 * inline row of images so the editor renders it tightly without spreading.
 * The row is centered by default to match the React Email preview — a left-clipped
 * row (see twitch-reset-password) happens when this falls back to start alignment.
 */
function replaceSocialIconTablesWithInlineRow(root: Element): void {
	const tables = Array.from(root.querySelectorAll("table"));

	for (const table of tables) {
		const directRow =
			table.querySelector(":scope > tbody > tr") ||
			table.querySelector(":scope > tr");
		if (!directRow) continue;

		const directCells = Array.from(directRow.querySelectorAll(":scope > td"));
		if (directCells.length < 2 || directCells.length > 8) continue;

		const icons = directCells.map((td) => {
			const imgs = td.querySelectorAll("img");
			if (imgs.length !== 1) return null;
			const img = imgs[0] as HTMLImageElement;
			if (!img) return null;

			// Heuristic: small square icons.
			const wAttr = img.getAttribute("width");
			const hAttr = img.getAttribute("height");
			const w = wAttr ? Number.parseInt(wAttr, 10) : undefined;
			const h = hAttr ? Number.parseInt(hAttr, 10) : undefined;
			if (
				(w !== undefined && !Number.isNaN(w) && w > 32) ||
				(h !== undefined && !Number.isNaN(h) && h > 32)
			) {
				return null;
			}

			return img;
		});

		if (icons.some((x) => x === null)) continue;

		// Another guard: icon tables typically have no nested tables inside cells.
		const hasNestedTables = directCells.some((td) => td.querySelector("table"));
		if (hasNestedTables) continue;

		// Keep the table as a table (do not flatten to <p>) so TipTap
		// keeps the 50%/50% right/left cell alignment that centers the
		// pair (Twitch: Twitter right + Facebook left). Flattening to <p>
		// lifted images out of the paragraph (image is block) and also
		// forced the whole cell to center, trapping the cursor in the
		// middle and adding 32px (2rem) on top of the container's 30px
		// gap. Preserve the original table layout and just tag it.
		table.setAttribute("data-icon-row", "true");
		// Fix cell alignment and image display for TipTap: `align="right"`
		// on a td does not reliably right-align a block `img{display:block}`.
		// Convert to `text-align` + `display:inline-block` so the pair
		// stays centered (right in left half, left in right half) in both
		// new pastes and already-stored Yjs.
		for (const td of directCells) {
			const cell = td as HTMLElement;
			const align = cell.getAttribute("align")?.toLowerCase();
			if (align === "right" || align === "left") {
				if (!cell.style.textAlign) cell.style.textAlign = align;
			}
			const img = cell.querySelector("img") as HTMLImageElement | null;
			if (img) {
				const cur = img.getAttribute("style") || "";
				if (/display\s*:\s*block/i.test(cur)) {
					img.setAttribute(
						"style",
						cur.replace(/display\s*:\s*block/i, "display:inline-block") +
							";vertical-align:middle",
					);
				} else if (!/display/i.test(cur)) {
					img.setAttribute(
						"style",
						`${cur};display:inline-block;vertical-align:middle`.replace(
							/^;/,
							"",
						),
					);
				}
			}
		}
		// Do not inject extra margin — the white card already has
		// margin-bottom:30px and the footer outer table has no gap.
		// Adding 2rem here doubles the space vs the HTML/iframe preview.
		// Cells keep their original align="right"/"left" and padding 8px.
	}
}

/**
 * The longhand CSS properties we want to ensure are always written out
 * explicitly so the editor's inspector (which reads paddingTop, borderRadius,
 * etc. individually) can parse them correctly.
 *
 * We use a scratch `<div>` to let the browser expand shorthands via cssText,
 * then read back only the longhands we need.
 */
const SPACING_LONGHANDS = [
	"padding-top",
	"padding-right",
	"padding-bottom",
	"padding-left",
	"margin-top",
	"margin-right",
	"margin-bottom",
	"margin-left",
	"border-top-left-radius",
	"border-top-right-radius",
	"border-bottom-right-radius",
	"border-bottom-left-radius",
	"border-top-width",
	"border-right-width",
	"border-bottom-width",
	"border-left-width",
	"border-top-color",
	"border-right-color",
	"border-bottom-color",
	"border-left-color",
	"border-top-style",
	"border-right-style",
	"border-bottom-style",
	"border-left-style",
] as const;

// Scratch element reused across calls to avoid repeated DOM creation.
// Declared lazily so this module works in SSR (no document available).
let _scratch: HTMLDivElement | null = null;
function getScratch(): HTMLDivElement {
	if (!_scratch) _scratch = document.createElement("div");
	return _scratch;
}

/**
 * The shorthand roots that will be replaced by the longhands above.
 * Any property whose name starts with one of these will be dropped in
 * favour of the expanded longhand equivalents.
 */
const SHORTHAND_ROOTS = new Set([
	"padding",
	"margin",
	"border",
	"border-radius",
	"border-width",
	"border-color",
	"border-style",
]);

/**
 * Walks every element under `root` and rewrites its `style` attribute so that
 * all shorthand properties (padding, margin, border, border-radius) are
 * replaced by their explicit longhand equivalents.
 *
 * This lets the editor's `parseCssValue` read `padding-top: 10px` directly
 * rather than having to understand `padding: 10px 20px 10px 20px`.
 */
function expandShorthandStyles(root: Element): void {
	const scratch = getScratch();
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = root;

	while (node) {
		const el = node as HTMLElement;
		const rawStyle = el.getAttribute?.("style");

		if (rawStyle) {
			// Let the browser parse and expand all shorthands
			scratch.style.cssText = rawStyle;

			// Gather longhands for all spacing/border properties
			const expansions: string[] = [];
			for (const prop of SPACING_LONGHANDS) {
				const val = scratch.style.getPropertyValue(prop);
				if (val) {
					expansions.push(`${prop}:${val}`);
				}
			}

			// Keep all remaining non-shorthand properties (color, font-size, etc.)
			const kept: string[] = [];
			for (let i = 0; i < scratch.style.length; i++) {
				const prop: string | undefined = scratch.style[i];
				if (!prop) continue;
				// Skip any property whose root is a shorthand we're expanding
				const isShorthand =
					SHORTHAND_ROOTS.has(prop) ||
					SPACING_LONGHANDS.includes(
						prop as (typeof SPACING_LONGHANDS)[number],
					);
				if (!isShorthand) {
					const val = scratch.style.getPropertyValue(prop);
					if (val) kept.push(`${prop}:${val}`);
				}
			}

			// Write the fully-expanded style back onto the real element
			const combined = [...kept, ...expansions].join(";");
			if (combined) {
				el.setAttribute("style", combined);
			} else {
				el.removeAttribute("style");
			}

			// Reset scratch for the next iteration
			scratch.style.cssText = "";
		}

		node = walker.nextNode();
	}
}
