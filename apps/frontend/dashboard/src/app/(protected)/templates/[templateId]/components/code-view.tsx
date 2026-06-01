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
					// Strip outer document scaffold (DOCTYPE / <html> / <head>) and
					// remove dangerous tags before handing off to the schema parser.
					const safeHtml = sanitizeEmailHtml(newVal);

					// generateJSON parses the HTML through the live schema — identical
					// to how the editor processes clipboard paste events internally.
					const extensions = editor.extensionManager.extensions;
					const json = generateJSON(safeHtml, extensions);
					editor.commands.setContent(json, { emitUpdate: false });
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
