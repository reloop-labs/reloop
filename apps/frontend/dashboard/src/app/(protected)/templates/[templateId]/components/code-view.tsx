"use client";

import Editor, { type Monaco } from "@monaco-editor/react";
import { composeReactEmail } from "@react-email/editor/core";
import * as Button from "@reloop/ui/button";
import { useCurrentEditor } from "@tiptap/react";
import { Check, Code2, Copy, Loader2, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const EDITOR_OPTIONS = {
	fontSize: 12,
	fontFamily: "var(--font-mono), Menlo, Monaco, 'Courier New', monospace",
	minimap: { enabled: false },
	wordWrap: "on" as const,
	lineNumbers: "on" as const,
	automaticLayout: true,
	tabSize: 2,
	scrollBeyondLastLine: false,
	padding: { top: 12, bottom: 12 },
	domReadOnly: false,
	readOnly: false,
	glyphMargin: false,
	folding: true,
	lineDecorationsWidth: 10,
	lineNumbersMinChars: 3,
};

const LoadingSkeleton = () => (
	<div className="flex h-full w-full flex-col gap-3 bg-bg-weak-50 p-4 dark:bg-[#282a36]">
		<div className="h-4 w-1/3 animate-pulse rounded bg-bg-soft-200 dark:bg-[#44475a]" />
		<div className="h-4 w-2/3 animate-pulse rounded bg-bg-soft-200 dark:bg-[#44475a]" />
		<div className="h-4 w-1/2 animate-pulse rounded bg-bg-soft-200 dark:bg-[#44475a]" />
		<div className="h-4 w-3/4 animate-pulse rounded bg-bg-soft-200 dark:bg-[#44475a]" />
		<div className="h-4 w-2/5 animate-pulse rounded bg-bg-soft-200 dark:bg-[#44475a]" />
	</div>
);

export function CodeEditor() {
	const { editor } = useCurrentEditor();
	const { resolvedTheme } = useTheme();
	const [htmlCode, setHtmlCode] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const isSelfUpdatingRef = useRef(false);
	// biome-ignore lint/suspicious/noExplicitAny: monaco editor reference
	const editorRef = useRef<any>(null);

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
	const handleCodeChange = useCallback(
		(newVal: string) => {
			setHtmlCode(newVal);
			if (editor) {
				isSelfUpdatingRef.current = true;
				try {
					let contentToSet = newVal;
					const lowerVal = newVal.toLowerCase();
					if (
						lowerVal.includes("<table") ||
						lowerVal.includes("<html") ||
						lowerVal.includes("<!doctype")
					) {
						contentToSet = cleanHtmlBeforeSetContent(newVal);
					}
					editor.commands.setContent(contentToSet, { emitUpdate: false });
				} catch (err) {
					console.error("Failed to set content from HTML code editor:", err);
				}
				isSelfUpdatingRef.current = false;
			}
		},
		[editor],
	);

	const handleEditorDidMount = useCallback(
		// biome-ignore lint/suspicious/noExplicitAny: monaco editor instance
		(editorInstance: any, monaco: Monaco) => {
			editorRef.current = editorInstance;

			monaco.editor.defineTheme("reloop-dark", {
				base: "vs-dark",
				inherit: true,
				rules: [
					{ token: "comment", foreground: "6272a4", fontStyle: "italic" },
					{ token: "keyword", foreground: "ff79c6" },
					{ token: "identifier", foreground: "f8f8f2" },
					{ token: "string", foreground: "f1fa8c" },
					{ token: "number", foreground: "bd93f9" },
					{ token: "tag", foreground: "ff79c6" },
					{ token: "tag.id", foreground: "8be9fd" },
					{ token: "tag.class", foreground: "8be9fd" },
					{ token: "attribute.name", foreground: "50fa7b" },
					{ token: "attribute.value", foreground: "f1fa8c" },
					{ token: "delimiter", foreground: "f8f8f2" },
					{ token: "delimiter.html", foreground: "f8f8f2" },
				],
				colors: {
					"editor.background": "#282a36",
					"editor.foreground": "#f8f8f2",
					"editor.lineHighlightBackground": "#44475a44",
					"editorCursor.foreground": "#f8f8f0",
					"editor.selectionBackground": "#44475a55",
					"editor.inactiveSelectionBackground": "#44475a33",
				},
			});

			monaco.editor.defineTheme("reloop-light", {
				base: "vs",
				inherit: true,
				rules: [],
				colors: {
					"editor.background": "#f9fafb",
					"editor.lineHighlightBackground": "#f3f4f6",
					"editorCursor.foreground": "#000000",
				},
			});

			// Track focus
			editorInstance.onDidFocusEditorText(() => {
				setIsFocused(true);
			});
			editorInstance.onDidBlurEditorText(() => {
				setIsFocused(false);
				updateHtmlCode();
			});
		},
		[updateHtmlCode],
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
		<div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
			<div className="flex h-10 shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:border-stroke-soft-100/40 dark:bg-[#1e1f29]">
				<div className="flex items-center gap-1.5 p-0">
					<Code2 size={14} className="text-text-strong-950 dark:text-white" />
					<span className="mr-1 font-semibold text-text-strong-950 text-xs dark:text-white">
						HTML Source
					</span>
					{isLoading && (
						<Loader2 size={12} className="animate-spin text-text-soft-400" />
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
						className="h-7 gap-1 rounded-md px-2 font-medium text-[11px] text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-[#44475a] dark:hover:text-white"
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
						className="h-7 gap-1 rounded-md px-2 font-medium text-[11px] text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-[#44475a] dark:hover:text-white"
					>
						{copied ? (
							<Check size={12} className="text-emerald-500" />
						) : (
							<Copy size={12} />
						)}
						Copy
					</Button.Root>
				</div>
			</div>
			<div className="relative min-h-0 flex-1">
				<Editor
					height="100%"
					width="100%"
					language="html"
					theme={resolvedTheme === "dark" ? "reloop-dark" : "reloop-light"}
					value={htmlCode}
					onChange={(val) => {
						if (val !== undefined) {
							handleCodeChange(val);
						}
					}}
					onMount={handleEditorDidMount}
					loading={<LoadingSkeleton />}
					options={EDITOR_OPTIONS}
				/>
			</div>
		</div>
	);
}

// Sanitizes full email HTML by stripping structural layout tables/wrappers and extracting only semantic blocks
function cleanHtmlBeforeSetContent(html: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// 1. Identify and extract button tables (single cell table containing only a link)
	const tables = Array.from(doc.querySelectorAll("table"));
	for (const table of tables) {
		const links = Array.from(table.querySelectorAll("a"));
		if (links.length === 1 && links[0]) {
			const link = links[0];
			const td = table.querySelector("td");

			const tableText = table.textContent?.trim() || "";
			const linkText = link.textContent?.trim() || "";

			if (tableText === linkText) {
				// Convert to react-email button link
				link.setAttribute("data-id", "react-email-button");

				// Pull background color, padding, border-radius, color styles from table/td to link if available
				const linkStyles: string[] = [];
				if (link.getAttribute("style")) {
					linkStyles.push(link.getAttribute("style") || "");
				}

				const bgColor =
					td?.getAttribute("bgcolor") ||
					td?.style.backgroundColor ||
					table.getAttribute("bgcolor") ||
					table.style.backgroundColor;

				if (bgColor) {
					linkStyles.push(`background-color: ${bgColor}`);
				}

				const color = link.style.color || td?.style.color;
				if (color) {
					linkStyles.push(`color: ${color}`);
				}

				const padding = td?.style.padding;
				if (padding) {
					linkStyles.push(`padding: ${padding}`);
				}

				const borderRadius = td?.style.borderRadius || table.style.borderRadius;
				if (borderRadius) {
					linkStyles.push(`border-radius: ${borderRadius}`);
				}

				const border = td?.style.border;
				if (border) {
					linkStyles.push(`border: ${border}`);
				}

				if (linkStyles.length > 0) {
					link.setAttribute("style", linkStyles.join("; "));
				}

				table.parentNode?.replaceChild(link, table);
			}
		}
	}

	// 2. Identify other links that look like buttons
	const allLinks = Array.from(doc.querySelectorAll("a"));
	for (const link of allLinks) {
		const className = link.getAttribute("class") || "";
		const style = link.getAttribute("style") || "";
		if (
			className.includes("button") ||
			(style.includes("background-color") && style.includes("padding")) ||
			link.getAttribute("data-id") === "react-email-button"
		) {
			link.setAttribute("data-id", "react-email-button");
		}
	}

	// 3. Helper to recursively extract semantic tags
	function getSemanticHtml(node: Node): string {
		if (node.nodeType === Node.TEXT_NODE) {
			return node.textContent || "";
		}

		if (node.nodeType !== Node.ELEMENT_NODE) {
			return "";
		}

		const el = node as HTMLElement;
		const tagName = el.tagName.toLowerCase();

		// Supported semantic tags
		if (
			[
				"p",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6",
				"ul",
				"ol",
				"li",
				"blockquote",
				"hr",
				"br",
				"img",
			].includes(tagName)
		) {
			let innerHtml = "";
			for (const child of Array.from(el.childNodes)) {
				innerHtml += getSemanticHtml(child);
			}

			if (tagName === "img") {
				const src = el.getAttribute("src") || "";
				const alt = el.getAttribute("alt") || "";
				const width = el.getAttribute("width") || "";
				const height = el.getAttribute("height") || "";
				return `<img src="${src}" alt="${alt}" ${width ? `width="${width}"` : ""} ${height ? `height="${height}"` : ""} />`;
			}

			if (tagName === "hr") return "<hr />";
			if (tagName === "br") return "<br />";

			const styleAttr = el.getAttribute("style") || "";
			const styleString = styleAttr ? ` style="${styleAttr}"` : "";

			return `<${tagName}${styleString}>${innerHtml}</${tagName}>`;
		}

		if (tagName === "a") {
			const href = el.getAttribute("href") || "";
			const style = el.getAttribute("style") || "";
			const dataId = el.getAttribute("data-id") || "";
			const dataIdString = dataId ? ` data-id="${dataId}"` : "";
			const text = el.textContent || "";
			return `<a href="${href}"${dataIdString} style="${style}">${text}</a>`;
		}

		if (
			[
				"strong",
				"b",
				"em",
				"i",
				"u",
				"code",
				"span",
				"font",
				"s",
				"strike",
			].includes(tagName)
		) {
			let innerHtml = "";
			for (const child of Array.from(el.childNodes)) {
				innerHtml += getSemanticHtml(child);
			}
			let targetTag = tagName;
			if (tagName === "b") targetTag = "strong";
			if (tagName === "i") targetTag = "em";
			if (tagName === "strike") targetTag = "s";

			const styleAttr = el.getAttribute("style") || "";
			const styleString = styleAttr ? ` style="${styleAttr}"` : "";

			return `<${targetTag}${styleString}>${innerHtml}</${targetTag}>`;
		}

		// Otherwise, unwrap the element
		let childHtml = "";
		for (const child of Array.from(el.childNodes)) {
			childHtml += getSemanticHtml(child);
		}
		return childHtml;
	}

	let resultHtml = "";
	for (const child of Array.from(doc.body.childNodes)) {
		resultHtml += getSemanticHtml(child);
	}

	return resultHtml;
}
