"use client";

import * as Button from "@reloop/ui/button";
import { useCurrentEditor } from "@tiptap/react";
import { Check, Code2, Copy, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Helper to format HTML with clean indentation
function formatHtml(html: string): string {
	let formatted = "";
	const reg = /(<[^>]+>)/g;
	const elements = html.replace(reg, "\r\n$1\r\n").split("\r\n");
	let indent = 0;
	elements.forEach((el) => {
		const trimmed = el.trim();
		if (trimmed === "") return;
		if (trimmed.match(/^<\/\w/)) {
			indent = Math.max(0, indent - 1);
		}
		formatted += "  ".repeat(indent) + trimmed + "\n";
		if (
			trimmed.match(/^<\w[^>]*[^/]>$/) &&
			!trimmed.match(/^<(br|hr|img|input|link|meta)/)
		) {
			indent++;
		}
	});
	return formatted.trim();
}

export function CodeEditor() {
	const { editor } = useCurrentEditor();
	const [htmlCode, setHtmlCode] = useState<string>("");
	const [copied, setCopied] = useState(false);
	const isSelfUpdatingRef = useRef(false);

	// 1. Initialize HTML code from editor
	useEffect(() => {
		if (editor && !htmlCode) {
			const initialHtml = editor.getHTML();
			setHtmlCode(formatHtml(initialHtml));
		}
	}, [editor, htmlCode]);

	// 2. Sync editor updates (Visual -> Code)
	useEffect(() => {
		if (!editor) return;

		const handleUpdate = () => {
			if (isSelfUpdatingRef.current) return;
			const currentEditorHtml = editor.getHTML();
			setHtmlCode(currentEditorHtml);
		};

		editor.on("update", handleUpdate);
		return () => {
			editor.off("update", handleUpdate);
		};
	}, [editor]);

	// 3. Sync code changes (Code -> Visual)
	const handleCodeChange = useCallback(
		(newVal: string) => {
			setHtmlCode(newVal);
			if (editor) {
				isSelfUpdatingRef.current = true;
				editor.commands.setContent(newVal, { emitUpdate: false });
				isSelfUpdatingRef.current = false;
			}
		},
		[editor],
	);

	// Copy to clipboard
	const handleCopy = useCallback(() => {
		if (!htmlCode) return;
		navigator.clipboard.writeText(htmlCode);
		setCopied(true);
		toast.success("HTML copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	}, [htmlCode]);

	// Format HTML
	const handleFormat = useCallback(() => {
		if (!htmlCode) return;
		try {
			const formatted = formatHtml(htmlCode);
			setHtmlCode(formatted);
			toast.success("HTML code formatted");
		} catch (err) {
			toast.error("Failed to format HTML code");
		}
	}, [htmlCode]);

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
				<div className="flex h-10 shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					<div className="flex items-center gap-1.5 p-0">
						<Code2 size={14} className="text-text-strong-950 dark:text-white" />
						<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
							HTML Source
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							onClick={handleFormat}
							className="h-7 gap-1 rounded-md px-2 font-medium text-[11px] text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
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
							className="h-7 gap-1 rounded-md px-2 font-medium text-[11px] text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
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
					<textarea
						value={htmlCode}
						onChange={(e) => handleCodeChange(e.target.value)}
						placeholder="<!-- Type your raw email HTML code here -->"
						className="absolute inset-0 h-full w-full resize-none overflow-y-auto bg-transparent p-4 font-mono text-text-strong-950 text-xs leading-relaxed focus:outline-none focus:ring-0 dark:text-zinc-100"
						spellCheck={false}
					/>
				</div>
		</div>
	);
}
