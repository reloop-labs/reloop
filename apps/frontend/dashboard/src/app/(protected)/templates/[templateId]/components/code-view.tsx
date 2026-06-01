"use client";

import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import { composeReactEmail } from "@react-email/editor/core";
import * as Button from "@reloop/ui/button";
import { generateJSON } from "@tiptap/html";
import { useCurrentEditor } from "@tiptap/react";
import { xcodeDark } from "@uiw/codemirror-theme-xcode";
import CodeMirror from "@uiw/react-codemirror";
import { Check, Code2, Copy, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "./use-editor-store";

export function CodeEditor() {
	const { editor } = useCurrentEditor();
	const [htmlCode, setHtmlCode] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const isSelfUpdatingRef = useRef(false);

	// Fetch compiled email HTML
	const updateHtmlCode = useCallback(async () => {
		if (!editor || isSelfUpdatingRef.current) return;
		setIsLoading(true);
		try {
			const result = await composeReactEmail({ editor });
			if (!isSelfUpdatingRef.current) {
				setHtmlCode(result.html);
			}
		} catch (err) {
			console.error("Failed to compose React Email HTML:", err);
			toast.error("Failed to generate email HTML");
		} finally {
			setIsLoading(false);
		}
	}, [editor]);

	// 1. Initialize HTML code from editor
	useEffect(() => {
		if (editor && !htmlCode) {
			updateHtmlCode();
		}
	}, [editor, htmlCode, updateHtmlCode]);

	// 2. Sync editor updates (Visual -> Code)
	useEffect(() => {
		if (!editor) return;

		const handleUpdate = () => {
			if (isSelfUpdatingRef.current || isFocused) return;
			updateHtmlCode();
		};

		editor.on("update", handleUpdate);
		return () => {
			editor.off("update", handleUpdate);
		};
	}, [editor, isFocused, updateHtmlCode]);

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
			setHtmlCode(newVal);
			if (editor) {
				isSelfUpdatingRef.current = true;
				try {
					// 1. Extract existing styles from the active editor state
					let existingStyles: any = null;
					editor.state.doc.descendants((node) => {
						if (node.type.name === "globalContent") {
							existingStyles = node.attrs.data?.styles;
						}
					});

					// 2. Parse body and container theme styles from the raw HTML code
					const parsedBodyAndContainer = extractThemingStylesFromHtml(newVal);

					// 3. Merge the parsed styles with existing styles to retain other settings
					const mergedStyles = mergeParsedStyles(existingStyles, parsedBodyAndContainer);

					// 4. Sanitize and prepare the HTML block for TipTap schema ingestion
					const safeHtml = sanitizeEmailHtml(newVal);

					// 5. Convert compiled HTML to TipTap JSON and load into the editor
					const extensions = editor.extensionManager.extensions;
					const json = generateJSON(safeHtml, extensions);
					editor.commands.setContent(json, { emitUpdate: false });

					// 6. Push the updated style configurations into the editor globalContent node
					editor.commands.setGlobalContent("styles", mergedStyles);
				} catch (err) {
					console.error("Failed to set content from HTML code editor:", err);
				}
				isSelfUpdatingRef.current = false;
			}
		},
		[editor],
	);

	// Format HTML (regenerate clean compiled HTML from visual editor state)
	const handleFormat = useCallback(() => {
		updateHtmlCode();
		toast.success("HTML formatted");
	}, [updateHtmlCode]);

	// Copy to clipboard
	const handleCopy = useCallback(() => {
		if (!htmlCode) return;
		navigator.clipboard.writeText(htmlCode);
		setCopied(true);
		toast.success("HTML copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	}, [htmlCode]);

	return (
		<div className="flex h-full w-full flex-col overflow-hidden">
			<div className="flex h-10 shrink-0 items-center justify-between px-3">
				<div className="flex items-center gap-1.5 p-0">
					<Code2 size={14} className="text-foreground" />
					<span className="mr-1 font-semibold text-foreground text-xs">
						HTML code editor
					</span>
					{isLoading && (
						<Loader2 size={12} className="animate-spin text-foreground/50" />
					)}
				</div>
				<div className="flex items-center gap-1.5">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						onClick={handleFormat}
						disabled={isLoading}
						className="h-7 gap-1 rounded-md px-2 font-medium text-[11px] text-foreground/70 hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800"
					>
						<RefreshCw size={12} />
						Format
					</Button.Root>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						onClick={handleCopy}
						disabled={!htmlCode || isLoading}
						className="h-7 gap-1 rounded-md px-2 font-medium text-[11px] text-foreground/70 hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800"
					>
						{copied ? (
							<Check size={12} className="text-green-600 dark:text-green-400" />
						) : (
							<Copy size={12} />
						)}
						Copy
					</Button.Root>
				</div>
			</div>
			<div className="relative flex min-h-0 flex-1">
				<CodeMirror
					value={htmlCode}
					height="100%"
					theme={xcodeDark}
					extensions={[html(), EditorView.lineWrapping]}
					onChange={handleCodeChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => {
						setIsFocused(false);
						updateHtmlCode();
					}}
					style={{
						fontSize: "12px",
						height: "100%",
						width: "100%",
						borderRadius: "24px",
						overflow: "hidden",
					}}
					className="h-full w-full overflow-hidden rounded-[24px] font-mono"
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
	const doc = parser.parseFromString(rawHtml, "text/html");

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

	// 4. Find container table and convert to a container div, preserving styles and attributes.
	let containerTable: Element | null = doc.querySelector('table[data-type="container"]');
	if (!containerTable) {
		// Look for any table that has container indicators (like max-width or class name)
		const tables = Array.from(doc.body.getElementsByTagName("table"));
		for (const table of tables) {
			const style = table.getAttribute("style") || "";
			const hasIndicator =
				table.className.includes("container") ||
				style.includes("max-width") ||
				style.includes("maxWidth") ||
				(/^\d+$/.test(table.getAttribute("width") || "") && table.getAttribute("width") !== "100%");
			if (hasIndicator) {
				containerTable = table;
				break;
			}
		}
		// Fallback to the first table if none found
		if (!containerTable && tables.length > 0) {
			containerTable = tables[0] || null;
		}
	}

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

			// Copy standard attributes (id, class, align, width, height) if present
			for (const attr of ["class", "id", "align", "width", "height"]) {
				const val = containerTable.getAttribute(attr);
				if (val) {
					containerDiv.setAttribute(attr, val);
				}
			}

			// Merge contentCell style (like padding)
			const cellStyleText = contentCell.getAttribute("style") || "";
			if (cellStyleText) {
				const cellScratch = doc.createElement("div") as HTMLDivElement;
				cellScratch.style.cssText = cellStyleText;
				for (let i = 0; i < cellScratch.style.length; i++) {
					const prop = cellScratch.style[i];
					if (!prop) continue;
					const val = cellScratch.style.getPropertyValue(prop);
					if (val) {
						scratch.style.setProperty(prop, val);
					}
				}
			}

			const mergedStyle = scratch.style.cssText;
			if (mergedStyle) {
				containerDiv.setAttribute("style", mergedStyle);
			}

			// Move all children from contentCell to containerDiv
			const contentNodes = Array.from(contentCell.childNodes);
			for (const node of contentNodes) {
				containerDiv.appendChild(node);
			}

			// Replace the entire body contents with the containerDiv
			doc.body.innerHTML = "";
			doc.body.appendChild(containerDiv);
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

	// NEW: Convert layout section tables to <section> tags
	convertSectionTablesToSections(doc.body);

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
	stripEmailCentering(doc.body);

	// 7. Expand CSS shorthand properties (padding, margin, border, border-radius)
	// into their individual longhand equivalents. Email HTML often uses
	// `padding: 10px 20px` etc., but the editor's inspector reads per-side
	// values (paddingTop, paddingRight, …) via parseCssValue. The browser
	// CSSOM expands shorthands automatically when we set cssText, so we use
	// that to produce explicit longhands on every element.
	expandShorthandStyles(doc.body);

	return doc.body.innerHTML;
}

/**
 * Recursively walks the DOM and removes email-specific centering attributes/styles
 * that would bleed into the TipTap document as textAlign marks.
 */
function stripEmailCentering(root: Element): void {
	// Unwrap <center> → replace with its children in-place
	for (const center of Array.from(root.getElementsByTagName("center"))) {
		const parent = center.parentNode;
		if (!parent) continue;
		while (center.firstChild) {
			parent.insertBefore(center.firstChild, center);
		}
		center.remove();
	}

	// Walk all remaining elements and strip centering attributes/styles
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = root;
	while (node) {
		const el = node as Element;

		// Remove align="center" attribute (common on <table>, <td>, <div>)
		if (el.getAttribute("align")?.toLowerCase() === "center") {
			el.removeAttribute("align");
		}

		// Strip text-align: center from inline styles
		const style = (el as HTMLElement).style;
		if (style && style.textAlign?.toLowerCase() === "center") {
			style.removeProperty("text-align");
		}

		node = walker.nextNode();
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
					SPACING_LONGHANDS.includes(prop as (typeof SPACING_LONGHANDS)[number]);
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
		return parseFloat(clean) || 0;
	}
	if (clean.endsWith("rem")) {
		return (parseFloat(clean) || 0) * 16;
	}
	if (clean.endsWith("em")) {
		return (parseFloat(clean) || 0) * 16;
	}
	const num = parseFloat(clean);
	if (!isNaN(num)) return num;
	return undefined;
}

function extractThemingStylesFromHtml(rawHtml: string): any[] {
	const parser = new DOMParser();
	const doc = parser.parseFromString(rawHtml, "text/html");

	// 1. Get body background color
	const bodyEl = doc.querySelector("body");
	let bodyBgColor = "#ffffff";
	if (bodyEl) {
		const style = bodyEl.getAttribute("style") || "";
		const scratch = document.createElement("div");
		scratch.style.cssText = style;
		bodyBgColor = scratch.style.backgroundColor || bodyEl.getAttribute("bgcolor") || "#ffffff";
	}

	// 2. Find container table/div
	let containerTable: Element | null = doc.querySelector('table[data-type="container"]');
	if (!containerTable) {
		const tables = Array.from(doc.getElementsByTagName("table"));
		for (const table of tables) {
			const style = table.getAttribute("style") || "";
			const hasIndicator =
				table.className.includes("container") ||
				style.includes("max-width") ||
				style.includes("maxWidth") ||
				(/^\d+$/.test(table.getAttribute("width") || "") && table.getAttribute("width") !== "100%");
			if (hasIndicator) {
				containerTable = table;
				break;
			}
		}
		if (!containerTable && tables.length > 0) {
			containerTable = tables[0] || null;
		}
	}

	let containerBg = "#ffffff";
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

		// Width resolution prioritizing maxWidth/width style over width attribute = 100%
		const styleMaxWidth = tableScratch.style.maxWidth;
		const styleWidth = tableScratch.style.width;
		const attrWidth = containerTable.getAttribute("width");

		let widthVal: string | null = null;
		if (styleMaxWidth && styleMaxWidth !== "100%") {
			widthVal = styleMaxWidth;
		} else if (styleWidth && styleWidth !== "100%") {
			widthVal = styleWidth;
		} else if (attrWidth && attrWidth !== "100%") {
			widthVal = attrWidth;
		}

		if (widthVal) {
			const parsedWidth = parseCssUnit(widthVal);
			if (parsedWidth) containerWidth = parsedWidth;
		}

		containerBg = tableScratch.style.backgroundColor || containerTable.getAttribute("bgcolor") || "#ffffff";
		
		const radiusAttr = tableScratch.style.borderRadius;
		if (radiusAttr) {
			const parsedRadius = parseCssUnit(radiusAttr);
			if (parsedRadius !== undefined) containerBorderRadius = parsedRadius;
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

			const widthAttr = divScratch.style.width || divScratch.style.maxWidth;
			if (widthAttr) {
				const parsedWidth = parseCssUnit(widthAttr);
				if (parsedWidth) containerWidth = parsedWidth;
			}

			containerBg = divScratch.style.backgroundColor || "#ffffff";

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
					classReference: "body"
				},
				{
					label: "Padding Top",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingTop",
					classReference: "body"
				},
				{
					label: "Padding Right",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingRight",
					classReference: "body"
				},
				{
					label: "Padding Bottom",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingBottom",
					classReference: "body"
				},
				{
					label: "Padding Left",
					type: "number",
					value: undefined,
					unit: "px",
					prop: "paddingLeft",
					classReference: "body"
				}
			]
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
						right: "Right"
					},
					prop: "align",
					classReference: "container"
				},
				{
					label: "Width",
					type: "number",
					value: containerWidth,
					unit: "px",
					prop: "width",
					classReference: "container"
				},
				{
					label: "Height",
					type: "number",
					unit: "px",
					prop: "height",
					classReference: "container"
				},
				{
					label: "Text",
					type: "color",
					value: "#000000",
					prop: "color",
					classReference: "container"
				},
				{
					label: "Background",
					type: "color",
					value: containerBg,
					prop: "backgroundColor",
					classReference: "container"
				},
				{
					label: "Padding Top",
					type: "number",
					value: containerPaddingTop,
					unit: "px",
					prop: "paddingTop",
					classReference: "container"
				},
				{
					label: "Padding Right",
					type: "number",
					value: containerPaddingRight,
					unit: "px",
					prop: "paddingRight",
					classReference: "container"
				},
				{
					label: "Padding Bottom",
					type: "number",
					value: containerPaddingBottom,
					unit: "px",
					prop: "paddingBottom",
					classReference: "container"
				},
				{
					label: "Padding Left",
					type: "number",
					value: containerPaddingLeft,
					unit: "px",
					prop: "paddingLeft",
					classReference: "container"
				},
				{
					label: "Corner radius",
					type: "number",
					value: containerBorderRadius,
					unit: "px",
					prop: "borderRadius",
					classReference: "container"
				},
				{
					label: "Border color",
					type: "color",
					value: "#000000",
					prop: "borderColor",
					classReference: "container"
				}
			]
		}
	];
}

function mergeParsedStyles(existingStyles: any, parsedBodyAndContainer: any[]): any[] {
	const baseGroups = Array.isArray(existingStyles) && existingStyles.length > 0
		? existingStyles
		: [
			{ id: "body", title: "Background", classReference: "body", inputs: [] },
			{ id: "container", title: "Content", classReference: "container", inputs: [] },
			{ id: "typography", title: "Text", classReference: "body", inputs: [] },
			{ id: "h1", title: "Title", classReference: "h1", inputs: [] },
			{ id: "h2", title: "Subtitle", classReference: "h2", inputs: [] },
			{ id: "h3", title: "Heading", classReference: "h3", inputs: [] },
			{ id: "text", title: "Paragraph", classReference: "paragraph", inputs: [] },
			{ id: "button", title: "Button", classReference: "button", inputs: [] },
			{ id: "link", title: "Link", classReference: "link", inputs: [] },
			{ id: "list", title: "List", classReference: "list", inputs: [] },
			{ id: "nested-list", title: "Nested List", classReference: "nestedList", inputs: [] },
			{ id: "list-item", title: "List Item", classReference: "listItem", inputs: [] },
			{ id: "code-block", title: "Code Block", classReference: "codeBlock", inputs: [] },
			{ id: "inline-code", title: "Inline Code", classReference: "inlineCode", inputs: [] },
		];

	const parsedMap = new Map(parsedBodyAndContainer.map(g => [g.id, g]));

	return baseGroups.map(group => {
		const parsedGroup = parsedMap.get(group.id);
		if (parsedGroup) {
			return parsedGroup;
		}
		return group;
	});
}

function convertSectionTablesToSections(root: Element): void {
	const tables = Array.from(root.getElementsByTagName("table"));
	
	for (const table of tables) {
		if (table.getAttribute("data-type") === "container" || table.className.includes("node-container")) {
			continue;
		}

		const rows = Array.from(table.querySelectorAll("tr")).filter(tr => tr.closest("table") === table);
		if (rows.length !== 1) continue;

		const row = rows[0];
		if (!row) continue;

		const cells = Array.from(row.querySelectorAll("td")).filter(td => td.closest("tr") === row);
		if (cells.length !== 1) continue;

		const cell = cells[0];
		if (!cell) continue;

		const tableScratch = root.ownerDocument.createElement("div");
		tableScratch.style.cssText = table.getAttribute("style") || "";

		const cellScratch = root.ownerDocument.createElement("div");
		cellScratch.style.cssText = cell.getAttribute("style") || "";

		// Determine if this is a styled section (with background, borders, or padding)
		const bg = tableScratch.style.backgroundColor;
		const hasBg = bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)" && bg !== "rgb(0, 0, 0)";
		const hasBorder = 
			tableScratch.style.borderWidth || tableScratch.style.border || tableScratch.style.borderStyle ||
			cellScratch.style.borderWidth || cellScratch.style.border || cellScratch.style.borderStyle;

		const pt = cellScratch.style.paddingTop || cellScratch.style.padding || tableScratch.style.paddingTop || tableScratch.style.padding;
		const pr = cellScratch.style.paddingRight || cellScratch.style.padding || tableScratch.style.paddingRight || tableScratch.style.padding;
		const pb = cellScratch.style.paddingBottom || cellScratch.style.padding || tableScratch.style.paddingBottom || tableScratch.style.padding;
		const pl = cellScratch.style.paddingLeft || cellScratch.style.padding || tableScratch.style.paddingLeft || tableScratch.style.padding;
		const hasPadding = pt || pr || pb || pl;

		const isStyledSection = hasBg || hasBorder || hasPadding;

		if (isStyledSection) {
			const section = root.ownerDocument.createElement("section");
			section.setAttribute("data-type", "section");
			
			const tableClass = table.getAttribute("class");
			if (tableClass) {
				section.setAttribute("class", `${tableClass} node-section`);
			} else {
				section.setAttribute("class", "node-section");
			}

			const scratch = root.ownerDocument.createElement("div");
			scratch.style.cssText = table.getAttribute("style") || "";

			const cellStyle = cell.getAttribute("style");
			if (cellStyle) {
				const cellScratchEl = root.ownerDocument.createElement("div");
				cellScratchEl.style.cssText = cellStyle;
				for (let i = 0; i < cellScratchEl.style.length; i++) {
					const prop = cellScratchEl.style[i];
					if (!prop) continue;
					const val = cellScratchEl.style.getPropertyValue(prop);
					if (val) {
						scratch.style.setProperty(prop, val);
					}
				}
			}

			const alignVal = table.getAttribute("align");
			if (alignVal) {
				scratch.style.textAlign = alignVal;
			}

			if (scratch.style.cssText) {
				section.setAttribute("style", scratch.style.cssText);
			}

			const childNodes = Array.from(cell.childNodes);
			for (const child of childNodes) {
				section.appendChild(child);
			}

			table.parentNode?.replaceChild(section, table);
		} else {
			// Un-styled spacer table -> unwrap it!
			const childNodes = Array.from(cell.childNodes);
			const parent = table.parentNode;
			if (parent) {
				// If there's a single child element, copy table-level margin styles to it
				const elementChildren = childNodes.filter(n => n.nodeType === 1) as Element[];
				if (elementChildren.length === 1) {
					const singleChild = elementChildren[0];
					const tableStyle = table.getAttribute("style");
					if (tableStyle && singleChild) {
						const childScratch = root.ownerDocument.createElement("div");
						childScratch.style.cssText = singleChild.getAttribute("style") || "";
						
						const tableScratchEl = root.ownerDocument.createElement("div");
						tableScratchEl.style.cssText = tableStyle;
						
						// Copy margin styles from table to child
						for (let i = 0; i < tableScratchEl.style.length; i++) {
							const prop = tableScratchEl.style[i];
							if (prop && prop.startsWith("margin")) {
								const val = tableScratchEl.style.getPropertyValue(prop);
								if (val) childScratch.style.setProperty(prop, val);
							}
						}
						
						if (childScratch.style.cssText) {
							singleChild.setAttribute("style", childScratch.style.cssText);
						}
					}
				}

				for (const child of childNodes) {
					parent.insertBefore(child, table);
				}
				parent.removeChild(table);
			}
		}
	}
}
