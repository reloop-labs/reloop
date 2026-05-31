"use client";

import { useCurrentEditor } from "@tiptap/react";
import { Copy, Check, RefreshCw, Code2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import * as Button from "@reloop/ui/button";

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
		if (trimmed.match(/^<\w[^>]*[^\/]>$/) && !trimmed.match(/^<(br|hr|img|input|link|meta)/)) {
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
		<div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden py-4 pr-4 pl-14 shrink-0">
			<div className="flex flex-col h-full rounded-[18px] border border-stroke-soft-200 dark:border-stroke-soft-100/40 bg-zinc-950 overflow-hidden shadow-sm">
				<div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
					<div className="flex items-center gap-2">
						<Code2 size={14} className="text-zinc-400" />
						<span className="font-semibold text-zinc-200 text-xs">HTML Source</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							onClick={handleFormat}
							className="h-7 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 px-2 rounded-md font-medium text-[11px] gap-1"
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
							className="h-7 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 px-2 rounded-md font-medium text-[11px] gap-1"
						>
							{copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
							Copy
						</Button.Root>
					</div>
				</div>
				<div className="flex-1 min-h-0 relative">
					<textarea
						value={htmlCode}
						onChange={(e) => handleCodeChange(e.target.value)}
						placeholder="<!-- Type your raw email HTML code here -->"
						className="absolute inset-0 w-full h-full bg-transparent text-zinc-100 font-mono text-xs leading-relaxed p-4 resize-none focus:outline-none focus:ring-0 overflow-y-auto"
						spellCheck={false}
					/>
				</div>
			</div>
		</div>
	);
}
