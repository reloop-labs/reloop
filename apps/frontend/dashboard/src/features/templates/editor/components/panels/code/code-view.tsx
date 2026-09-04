import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import { composeReactEmail } from "@react-email/editor/core";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { generateJSON } from "@tiptap/html";
import { type Editor, useCurrentEditor } from "@tiptap/react";
import { xcodeDark } from "@uiw/codemirror-theme-xcode";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { applyImportedEmailCss } from "#/features/templates/editor/utils/apply-imported-email-css";
import {
	absolutizeEmailAssetUrls,
	inlineEmailStylesheet,
	readDocumentBodyBackground,
	scopeEmailCssForEditor,
} from "#/features/templates/editor/utils/inline-email-stylesheet";
import { preserveEmailLinkUnderlines } from "#/features/templates/editor/utils/preserve-email-link-underlines";
import { prettyPrintHtml } from "#/features/templates/editor/utils/pretty-print-html";
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
	readableTextColor,
	rewriteLowContrastInlineText,
} from "#/features/templates/editor/utils/readable-text-color";
import {
	applyEmailColumnWidth,
	emailColumnMaxWidthCss,
	findEmailContainerTable,
	prepareEmailHtmlForParse,
	stripEmailCentering,
} from "#/features/templates/editor/utils/strip-email-centering";

export function CodeEditor({ onClose }: { onClose?: () => void } = {}) {
	const { editor } = useCurrentEditor();
	const htmlCode = useEditorStore((s) => s.codeHtml);
	const setHtmlCode = useEditorStore((s) => s.setCodeHtml);
	const setHtmlLocked = useEditorStore((s) => s.setHtmlLocked);
	const [isLoading, setIsLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const isSelfUpdatingRef = useRef(false);
	const skipNextCodeChangeRef = useRef(false);

	const updateHtmlCode = useCallback(async () => {
		if (!editor || isSelfUpdatingRef.current) return;
		if (useEditorStore.getState().htmlLocked) return;
		setIsLoading(true);
		try {
			const result = await composeReactEmail({ editor });
			if (!isSelfUpdatingRef.current && !useEditorStore.getState().htmlLocked) {
				setHtmlCode(result.html);
			}
		} catch (err) {
			console.error("Failed to compose React Email HTML:", err);
			toast.error("Failed to generate email HTML");
		} finally {
			setIsLoading(false);
		}
	}, [editor, setHtmlCode]);

	useEffect(() => {
		if (!editor) return;
		if (useEditorStore.getState().htmlLocked) return;
		if (useEditorStore.getState().codeHtml) return;
		void updateHtmlCode();
	}, [editor, updateHtmlCode]);

	// 3. Sync code changes (Code -> Visual)
	//
	// We use `generateJSON` from `@tiptap/html` — the exact same function that
	// the editor's internal paste handler uses (see createPasteHandler.ts in
	// @react-email/editor source). It runs the HTML through the editor's own
	// extension schema (parseHTML rules) which correctly maps:
	//   - table[role="presentation"] + max-width  →  container node
	//   - a[data-id="react-email-button"]         →  button node
	//   - img[src]                                →  image node
	//   - a[href] / a[target]                     →  link mark
	//   - span[style]                             →  preserved-style mark
	//   - body                                    →  body node
	const handleCodeChange = useCallback(
		(newVal: string) => {
			if (skipNextCodeChangeRef.current) {
				skipNextCodeChangeRef.current = false;
				setHtmlCode(newVal);
				return;
			}
			setHtmlLocked(true);
			setHtmlCode(newVal);
			if (editor) {
				isSelfUpdatingRef.current = true;
				try {
					let contentToSet: any = newVal;
					const lowerVal = newVal.toLowerCase();
					const isFullHtml =
						lowerVal.includes("<table") ||
						lowerVal.includes("<html") ||
						lowerVal.includes("<!doctype");

					if (isFullHtml) {
						const safeHtml = sanitizeEmailHtml(newVal);
						const extensions = editor.extensionManager.extensions as any;
						contentToSet = generateJSON(safeHtml, extensions);
					}
					editor.commands.setContent(contentToSet, { emitUpdate: false });

					// Defer style extraction and settings application until the editor has settled
					// and automatically seeded the globalContent node/styles array.
					if (isFullHtml) {
						applyPastedEmailTheme(editor, newVal);
					}
				} catch (err) {
					console.error("Failed to set content from HTML code editor:", err);
				}
				isSelfUpdatingRef.current = false;
			}
		},
		[editor, setHtmlCode, setHtmlLocked],
	);

	const handleFormat = useCallback(() => {
		skipNextCodeChangeRef.current = true;
		setHtmlLocked(true);
		setHtmlCode(prettyPrintHtml(htmlCode));
		toast.success("HTML formatted");
	}, [htmlCode, setHtmlCode, setHtmlLocked]);

	// Copy to clipboard
	const handleCopy = useCallback(() => {
		if (!htmlCode) return;
		navigator.clipboard.writeText(htmlCode);
		setCopied(true);
		toast.success("HTML copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	}, [htmlCode]);

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
			<div className="flex h-10 shrink-0 items-center justify-between border-stroke-soft-100 border-b px-3 dark:border-stroke-soft-100/40">
				<div className="flex items-center gap-1.5 p-0">
					<Icon name="code" className="h-3.5 w-3.5 text-text-sub-600" />
					<span className="mr-1 font-semibold text-label-xs text-text-strong-950">
						HTML code editor
					</span>
					{isLoading && <Spinner size={12} />}
				</div>
				<div className="flex items-center gap-1.5">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						onClick={handleFormat}
						disabled={isLoading}
						className="h-7 gap-1 rounded-md px-2 font-medium text-[11px] text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
					>
						<Icon name="refresh-cw" className="h-3 w-3" />
						Format
					</Button.Root>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						onClick={handleCopy}
						disabled={!htmlCode || isLoading}
						className="h-7 gap-1 rounded-md px-2 font-medium text-[11px] text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
					>
						{copied ? (
							<Icon name="check" className="h-3 w-3 text-success-base" />
						) : (
							<Icon name="copy" className="h-3 w-3" />
						)}
						Copy
					</Button.Root>
					{onClose ? (
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg p-1 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
							aria-label="Close code view"
						>
							<Icon name="cross" className="h-3.5 w-3.5" />
						</button>
					) : null}
				</div>
			</div>
			<div className="relative flex min-h-0 flex-1">
				<CodeMirror
					value={htmlCode}
					height="100%"
					theme={xcodeDark}
					extensions={[html(), EditorView.lineWrapping]}
					onChange={handleCodeChange}
					style={{
						fontSize: "12px",
						height: "100%",
						width: "100%",
					}}
					className="h-full w-full font-mono"
				/>
			</div>
		</div>
	);
}

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
 * Minimal sanitizer that mirrors what the `@react-email/editor` paste handler
 * (`sanitizePastedHtml`) does before calling `generateJSON`:
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
function sanitizeEmailHtml(rawHtml: string): string {
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

function parseCssUnit(val: string | null | undefined): number | undefined {
	if (!val) return undefined;
	const clean = val.trim().toLowerCase();
	if (clean.endsWith("px")) {
		return Number.parseFloat(clean) || 0;
	}
	if (clean.endsWith("rem")) {
		return (Number.parseFloat(clean) || 0) * 16;
	}
	if (clean.endsWith("em")) {
		return (Number.parseFloat(clean) || 0) * 16;
	}
	const num = Number.parseFloat(clean);
	if (!Number.isNaN(num)) return num;
	return undefined;
}

function extractThemingStylesFromHtml(rawHtml: string): any[] {
	const parser = new DOMParser();
	const doc = parser.parseFromString(rawHtml, "text/html");

	// 1. Get body background color — do not invent #ffffff when the
	// HTML leaves the page gray and paints white only on inner sections.
	const bodyBgColor = readDocumentBodyBackground(doc) || undefined;

	// 2. Find the innermost email column table
	const containerTable = findEmailContainerTable(doc);

	let containerBg: string | undefined;
	let containerTextColor: string | undefined;
	let containerWidth = 600;
	let containerPaddingTop = 0;
	let containerPaddingRight = 0;
	let containerPaddingBottom = 0;
	let containerPaddingLeft = 0;
	let containerBorderRadius = 0;
	let containerAlign = "center";

	if (containerTable) {
		const contentCell =
			containerTable.querySelector("tbody > tr > td") ||
			containerTable.querySelector("tr > td") ||
			containerTable.querySelector("td");

		const tableScratch = document.createElement("div");
		tableScratch.style.cssText = containerTable.getAttribute("style") || "";

		const alignAttr = containerTable.getAttribute("align");
		if (alignAttr) {
			containerAlign = alignAttr.toLowerCase();
		}

		const widthVal = emailColumnMaxWidthCss(containerTable);
		if (widthVal) {
			const parsedWidth = parseCssUnit(widthVal);
			if (parsedWidth) containerWidth = parsedWidth;
		}

		containerBg =
			tableScratch.style.backgroundColor ||
			containerTable.getAttribute("bgcolor") ||
			undefined;

		const radiusAttr = tableScratch.style.borderRadius;
		if (radiusAttr) {
			const parsedRadius = parseCssUnit(radiusAttr);
			if (parsedRadius !== undefined) containerBorderRadius = parsedRadius;
		}

		// Read text color from the container's content cell or from the
		// wrapper TD that provides base typography for the email.
		if (contentCell) {
			const colorCellScratch = document.createElement("div");
			colorCellScratch.style.cssText = contentCell.getAttribute("style") || "";
			if (colorCellScratch.style.color) {
				containerTextColor = colorCellScratch.style.color;
			}
		}
		const outerTd = containerTable.closest?.("td");
		if (outerTd && outerTd !== contentCell) {
			const outerScratch = document.createElement("div");
			outerScratch.style.cssText = outerTd.getAttribute("style") || "";
			if (outerScratch.style.color) {
				containerTextColor = outerScratch.style.color;
			}
		}

		// Read padding from container table style (some react-email/tailwind outputs put padding on the table)
		const tpt = tableScratch.style.paddingTop || tableScratch.style.padding;
		const tpr = tableScratch.style.paddingRight || tableScratch.style.padding;
		const tpb = tableScratch.style.paddingBottom || tableScratch.style.padding;
		const tpl = tableScratch.style.paddingLeft || tableScratch.style.padding;

		if (tpt) {
			const v = parseCssUnit(tpt);
			if (v !== undefined) containerPaddingTop = v;
		}
		if (tpr) {
			const v = parseCssUnit(tpr);
			if (v !== undefined) containerPaddingRight = v;
		}
		if (tpb) {
			const v = parseCssUnit(tpb);
			if (v !== undefined) containerPaddingBottom = v;
		}
		if (tpl) {
			const v = parseCssUnit(tpl);
			if (v !== undefined) containerPaddingLeft = v;
		}

		// Read padding from container td (takes precedence)
		if (contentCell) {
			const cellScratch = document.createElement("div");
			cellScratch.style.cssText = contentCell.getAttribute("style") || "";

			const pt = cellScratch.style.paddingTop || cellScratch.style.padding;
			const pr = cellScratch.style.paddingRight || cellScratch.style.padding;
			const pb = cellScratch.style.paddingBottom || cellScratch.style.padding;
			const pl = cellScratch.style.paddingLeft || cellScratch.style.padding;

			if (pt) {
				const v = parseCssUnit(pt);
				if (v !== undefined) containerPaddingTop = v;
			}
			if (pr) {
				const v = parseCssUnit(pr);
				if (v !== undefined) containerPaddingRight = v;
			}
			if (pb) {
				const v = parseCssUnit(pb);
				if (v !== undefined) containerPaddingBottom = v;
			}
			if (pl) {
				const v = parseCssUnit(pl);
				if (v !== undefined) containerPaddingLeft = v;
			}
		}
	} else {
		const divContainer = doc.querySelector('div[data-type="container"]');
		if (divContainer) {
			const divScratch = document.createElement("div");
			divScratch.style.cssText = divContainer.getAttribute("style") || "";

			const widthVal = emailColumnMaxWidthCss(divContainer);
			if (widthVal) {
				const parsedWidth = parseCssUnit(widthVal);
				if (parsedWidth) containerWidth = parsedWidth;
			}

			containerBg = divScratch.style.backgroundColor || undefined;

			const radiusAttr = divScratch.style.borderRadius;
			if (radiusAttr) {
				const parsedRadius = parseCssUnit(radiusAttr);
				if (parsedRadius !== undefined) containerBorderRadius = parsedRadius;
			}

			const pt = divScratch.style.paddingTop || divScratch.style.padding;
			const pr = divScratch.style.paddingRight || divScratch.style.padding;
			const pb = divScratch.style.paddingBottom || divScratch.style.padding;
			const pl = divScratch.style.paddingLeft || divScratch.style.padding;

			if (pt) {
				const v = parseCssUnit(pt);
				if (v !== undefined) containerPaddingTop = v;
			}
			if (pr) {
				const v = parseCssUnit(pr);
				if (v !== undefined) containerPaddingRight = v;
			}
			if (pb) {
				const v = parseCssUnit(pb);
				if (v !== undefined) containerPaddingBottom = v;
			}
			if (pl) {
				const v = parseCssUnit(pl);
				if (v !== undefined) containerPaddingLeft = v;
			}
		}
	}

	const mixedSurfaces = emailHasMixedBackgrounds(doc.body);
	const resolvedTextColor = mixedSurfaces
		? undefined
		: readableTextColor(
				containerBg && containerBg !== "#ffffff" ? containerBg : bodyBgColor,
				containerTextColor,
			);

	return [
		{
			id: "body",
			title: "Background",
			classReference: "body",
			inputs: [
				{
					label: "Background",
					type: "color",
					value: bodyBgColor,
					prop: "backgroundColor",
					classReference: "body",
				},
				{
					label: "Padding Top",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingTop",
					classReference: "body",
				},
				{
					label: "Padding Right",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingRight",
					classReference: "body",
				},
				{
					label: "Padding Bottom",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingBottom",
					classReference: "body",
				},
				{
					label: "Padding Left",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingLeft",
					classReference: "body",
				},
			],
		},
		{
			id: "container",
			title: "Content",
			classReference: "container",
			inputs: [
				{
					label: "Align",
					type: "select",
					value: containerAlign,
					options: {
						left: "Left",
						center: "Center",
						right: "Right",
					},
					prop: "align",
					classReference: "container",
				},
				{
					label: "Width",
					type: "number",
					value: containerWidth,
					unit: "px",
					prop: "width",
					classReference: "container",
				},
				{
					label: "Height",
					type: "number",
					unit: "px",
					prop: "height",
					classReference: "container",
				},
				{
					label: "Text",
					type: "color",
					value: resolvedTextColor,
					prop: "color",
					classReference: "container",
				},
				{
					label: "Background",
					type: "color",
					value: containerBg,
					prop: "backgroundColor",
					classReference: "container",
				},
				{
					label: "Padding Top",
					type: "number",
					value: containerPaddingTop,
					unit: "px",
					prop: "paddingTop",
					classReference: "container",
				},
				{
					label: "Padding Right",
					type: "number",
					value: containerPaddingRight,
					unit: "px",
					prop: "paddingRight",
					classReference: "container",
				},
				{
					label: "Padding Bottom",
					type: "number",
					value: containerPaddingBottom,
					unit: "px",
					prop: "paddingBottom",
					classReference: "container",
				},
				{
					label: "Padding Left",
					type: "number",
					value: containerPaddingLeft,
					unit: "px",
					prop: "paddingLeft",
					classReference: "container",
				},
				{
					label: "Corner radius",
					type: "number",
					value: containerBorderRadius,
					unit: "px",
					prop: "borderRadius",
					classReference: "container",
				},
				{
					label: "Border color",
					type: "color",
					value: "#000000",
					prop: "borderColor",
					classReference: "container",
				},
			],
		},
	];
}

function mergeParsedStyles(
	existingStyles: any,
	parsedBodyAndContainer: any[],
): any[] {
	const baseGroups =
		Array.isArray(existingStyles) && existingStyles.length > 0
			? existingStyles
			: [
					{
						id: "body",
						title: "Background",
						classReference: "body",
						inputs: [],
					},
					{
						id: "container",
						title: "Content",
						classReference: "container",
						inputs: [],
					},
					{
						id: "typography",
						title: "Text",
						classReference: "body",
						inputs: [],
					},
					{ id: "h1", title: "Title", classReference: "h1", inputs: [] },
					{ id: "h2", title: "Subtitle", classReference: "h2", inputs: [] },
					{ id: "h3", title: "Heading", classReference: "h3", inputs: [] },
					{
						id: "text",
						title: "Paragraph",
						classReference: "paragraph",
						inputs: [],
					},
					{
						id: "button",
						title: "Button",
						classReference: "button",
						inputs: [],
					},
					{ id: "link", title: "Link", classReference: "link", inputs: [] },
					{ id: "list", title: "List", classReference: "list", inputs: [] },
					{
						id: "nested-list",
						title: "Nested List",
						classReference: "nestedList",
						inputs: [],
					},
					{
						id: "list-item",
						title: "List Item",
						classReference: "listItem",
						inputs: [],
					},
					{
						id: "code-block",
						title: "Code Block",
						classReference: "codeBlock",
						inputs: [],
					},
					{
						id: "inline-code",
						title: "Inline Code",
						classReference: "inlineCode",
						inputs: [],
					},
				];

	const parsedMap = new Map(parsedBodyAndContainer.map((g) => [g.id, g]));

	return baseGroups.map((group) => {
		const parsedGroup = parsedMap.get(group.id);
		if (parsedGroup) {
			return parsedGroup;
		}
		return group;
	});
}

// Helper to extract global theme styling details from custom pasted HTML
function parseGlobalStylesFromHtml(html: string) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	absolutizeEmailAssetUrls(doc);

	// 1. Extract style block contents
	const styleTags = doc.querySelectorAll("style");
	let cssString = "";
	for (const tag of Array.from(styleTags)) {
		cssString += `${tag.textContent}\n`;
	}

	// Rewrite `body` / `html` selectors to target the TipTap root instead.
	// The visual builder renders inside a `.ProseMirror` element (not an iframe),
	// so keeping `body { ... }` rules would do nothing, and using `&` is not valid
	// plain CSS. Scoping to `.tiptap.ProseMirror` preserves the original intent (fonts,
	// spacing, resets) without leaking styles across the app shell.
	cssString = scopeEmailCssForEditor(cssString);

	// 2. Extract external stylesheet links (e.g. google fonts) so they can load in the head
	const links = doc.querySelectorAll(
		"link[rel='stylesheet'], link[href*='fonts.googleapis.com']",
	);
	let fontImports = "";
	for (const link of Array.from(links)) {
		const href = link.getAttribute("href");
		if (href) {
			fontImports += `@import url('${href}');\n`;
		}
	}

	if (fontImports) {
		cssString = fontImports + cssString;
	}

	// 2.5 Apply a strong "email base" reset to the editor canvas.
	//
	// The visual builder runs inside TipTap's `.ProseMirror`, which has its own
	// default typography (margins, font sizing, colors). Email HTML assumes a
	// mostly-neutral environment (like an iframe/email client), so we read the
	// outer email wrapper `<td>` styles and apply them to `.ProseMirror` with
	// higher specificity to match React Email's preview more closely.
	const wrapperTd =
		doc.querySelector('td[style*="min-height:100%"]') ||
		doc.querySelector('td[style*="min-height: 100%"]');
	if (wrapperTd) {
		const scratch = doc.createElement("div") as HTMLDivElement;
		scratch.style.cssText = wrapperTd.getAttribute("style") || "";

		const baseFontFamily = scratch.style.fontFamily;
		const baseFontSize = scratch.style.fontSize;
		const baseLineHeight = scratch.style.lineHeight;
		const baseColor = scratch.style.color;
		const baseBg = scratch.style.backgroundColor;
		const baseLetterSpacing = scratch.style.letterSpacing;
		const mixedSurfaces = emailHasMixedBackgrounds(doc.body);

		// Defaults only — no !important. Pasted inline font-size / family on
		// headings and footers must win over the wrapper td (15px body text
		// must not paint a 13px / 320px footer at 15px).
		const proseMirrorBase = [
			".tiptap.ProseMirror, .ProseMirror{",
			baseFontFamily ? `font-family:${baseFontFamily};` : "",
			baseFontSize ? `font-size:${baseFontSize};` : "",
			baseLineHeight ? `line-height:${baseLineHeight};` : "",
			baseColor && !mixedSurfaces ? `color:${baseColor};` : "",
			baseBg && !mixedSurfaces ? `background-color:${baseBg};` : "",
			baseLetterSpacing ? `letter-spacing:${baseLetterSpacing};` : "",
			"}",
			// Kill TipTap/EmailTheming block padding without !important on
			// margin so pasted inline spacing (Dither 2.5rem) still wins.
			".tiptap.ProseMirror p, .ProseMirror p{margin:0;}",
			".tiptap.ProseMirror h1, .tiptap.ProseMirror h2, .tiptap.ProseMirror h3, .ProseMirror h1, .ProseMirror h2, .ProseMirror h3{margin:0;}",
			".tiptap.ProseMirror table, .ProseMirror table{border-collapse:separate !important;}",
			".tiptap.ProseMirror img, .ProseMirror img{display:block;}",
			"",
		]
			.filter(Boolean)
			.join("");

		cssString = proseMirrorBase + cssString;
	}

	// Body canvas only. Do not steal an inner section color (Halo gray)
	// or the footer, which sits on white, goes gray with the rest.
	const bodyBg = readDocumentBodyBackground(doc);

	// Fallback: many React Email templates (e.g., Twitch) set body bg via
	// `Body` inline style, not via the `min-height:100%` wrapper td. Without
	// this, `cssString` has no ProseMirror background and the canvas flashes
	// white until globalContent hydrates, making the whole email look grayish
	// vs the iframe preview which already has body gray. Inject it globally
	// here so visual == code preview for any template.
	if (!wrapperTd && bodyBg) {
		const scratch = doc.createElement("div") as HTMLDivElement;
		scratch.style.backgroundColor = bodyBg;
		const normalizedBg = scratch.style.backgroundColor;
		if (normalizedBg) {
			const bodyRule = `.tiptap.ProseMirror, .ProseMirror{background-color:${normalizedBg};}`;
			// Prepend so container white (via node-container) can overlay.
			cssString = bodyRule + cssString;
		}
	}

	// Column width from the pasted wrapper — not the outer 100% body table.
	// Stamp max-width onto the canvas container so `width: 100%` cannot
	// fill the dashboard. Keep the source string (37.5em stays em).
	let containerWidth: number | null = null;
	const columnTable = findEmailContainerTable(doc.body);
	const columnMax = columnTable ? emailColumnMaxWidthCss(columnTable) : null;
	if (columnMax) {
		const parsedWidth = parseCssUnit(columnMax);
		if (parsedWidth) containerWidth = parsedWidth;
		cssString += `.tiptap.ProseMirror .node-container,.tiptap.ProseMirror [data-type="container"],.ProseMirror .node-container,.ProseMirror [data-type="container"]{width:100%;max-width:${columnMax};}`;
	}

	return {
		css: cssString.trim(),
		bodyBg: bodyBg.trim(),
		containerWidth,
	};
}

/** Same theme pass the HTML editor runs after a full-email paste. */
export function applyPastedEmailTheme(editor: Editor, rawHtml: string): void {
	window.setTimeout(() => {
		try {
			const parsed = parseGlobalStylesFromHtml(rawHtml);
			const existingAfterSeed = getGlobalStylesArray(editor);

			if (parsed.css) {
				applyImportedEmailCss(parsed.css);
				useEditorStore.getState().setImportedEmailCss(parsed.css);
			}

			const parsedBodyAndContainer = extractThemingStylesFromHtml(rawHtml);

			let mergedStyles = mergeParsedStyles(
				existingAfterSeed,
				parsedBodyAndContainer,
			);

			if (parsed.bodyBg) {
				mergedStyles = updateGlobalStyleValue(
					mergedStyles,
					"body",
					"backgroundColor",
					parsed.bodyBg,
				);
			}

			const containerBg =
				parsed.bodyBg ||
				findStyleInputValue(mergedStyles, "container", "backgroundColor");
			const extractedColor = findStyleInputValue(
				mergedStyles,
				"container",
				"color",
			);
			const mixedSurfaces = emailHasMixedBackgrounds(
				new DOMParser().parseFromString(rawHtml, "text/html").body,
			);
			const textColor = mixedSurfaces
				? undefined
				: readableTextColor(
						typeof containerBg === "string" ? containerBg : undefined,
						typeof extractedColor === "string" ? extractedColor : undefined,
					);
			if (textColor) {
				mergedStyles = updateGlobalStyleValue(
					mergedStyles,
					"container",
					"color",
					textColor,
				);
				mergedStyles = updateGlobalStyleValue(
					mergedStyles,
					"body",
					"color",
					textColor,
				);
			}

			mergedStyles = updateGlobalStyleValue(
				mergedStyles,
				"container",
				"height",
				undefined,
			);
			mergedStyles = updateGlobalStyleValue(
				mergedStyles,
				"container",
				"borderWidth",
				0,
			);

			editor.commands.setGlobalContent("styles", mergedStyles);
		} catch (err) {
			console.error("Failed to apply pasted email theme:", err);
		}
	}, 50);
}

// Helper to retrieve the current styles array from the Tiptap document
function getGlobalStylesArray(editor: any): any[] {
	let globalContentNode: any = null;
	editor.state.doc.descendants((node: any) => {
		if (node.type.name === "globalContent") {
			globalContentNode = node;
			return false;
		}
	});
	return globalContentNode?.attrs?.data?.styles || [];
}

function findStyleInputValue(styles: any[], componentId: string, prop: string) {
	const group = styles?.find((g) => g.id === componentId);
	return group?.inputs?.find((input: any) => input.prop === prop)?.value;
}

// Helper to update a specific property in the styles array
function updateGlobalStyleValue(
	styles: any[],
	componentId: string,
	prop: string,
	value: any,
) {
	if (!styles || !Array.isArray(styles)) return styles;
	return styles.map((group) => {
		if (group.id !== componentId) return group;
		return {
			...group,
			inputs: group.inputs.map((input: any) => {
				if (input.prop !== prop) return input;
				return { ...input, value };
			}),
		};
	});
}

export {
	parseGlobalStylesFromHtml,
	extractThemingStylesFromHtml,
	mergeParsedStyles,
	updateGlobalStyleValue,
	findStyleInputValue,
	getGlobalStylesArray,
	sanitizeEmailHtml,
};
