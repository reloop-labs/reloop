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
 *  4. Return `body.innerHTML` so `generateJSON` receives clean inner HTML.
 *
 * We do NOT strip tables, divs, or any structural elements — the editor's
 * own `parseHTML()` rules (container, section, button, image, link, …) are
 * responsible for mapping them to the correct TipTap node types.
 */
function sanitizeEmailHtml(rawHtml: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(rawHtml, "text/html");

	// Remove dangerous elements
	for (const tag of FORBIDDEN_TAGS) {
		for (const el of Array.from(doc.body.getElementsByTagName(tag))) {
			el.remove();
		}
	}

	// Strip email-layout centering so TipTap doesn't inherit center-alignment
	// from the outer scaffold. Email HTML typically centers content via:
	//   <center>…</center>
	//   <table align="center">…</table>
	//   style="text-align: center" on wrapper elements
	stripEmailCentering(doc.body);

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
