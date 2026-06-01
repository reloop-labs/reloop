"use client";

import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import { composeReactEmail } from "@react-email/editor/core";
import * as Button from "@reloop/ui/button";
import { useCurrentEditor } from "@tiptap/react";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
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
						<Loader2 size={12} className="animate-spin text-[#6272a4]" />
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
						className="h-7 gap-1 rounded-md px-2 font-medium text-[11px] text-foreground/70 hover:bg-[#44475a] hover:text-foreground dark:hover:bg-[#44475a]"
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
						className="h-7 gap-1 rounded-md px-2 font-medium text-[#f8f8f2]/70 text-[11px] hover:bg-[#44475a] hover:text-[#f8f8f2] dark:hover:bg-[#44475a]"
					>
						{copied ? (
							<Check size={12} className="text-[#50fa7b]" />
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
					theme={tokyoNight}
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
					className="h-full w-full rounded-[24px] overflow-hidden font-mono"
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
