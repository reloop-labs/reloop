"use client";

import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useCurrentEditor } from "@tiptap/react";
import { xcodeDark } from "@uiw/codemirror-theme-xcode";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { loadHtmlIntoEditor } from "./load-html-into-editor";
import { prettyPrintHtml } from "./pretty-print-html";
import { useEmailHtmlEditorStore } from "./store";

export function EmailHtmlCodeEditor({ onClose }: { onClose?: () => void }) {
	const { editor } = useCurrentEditor();
	const htmlCode = useEmailHtmlEditorStore((s) => s.codeHtml);
	const setHtmlCode = useEmailHtmlEditorStore((s) => s.setCodeHtml);
	const [copied, setCopied] = useState(false);
	const skipApplyRef = useRef(false);

	const handleCodeChange = useCallback(
		(newVal: string) => {
			if (skipApplyRef.current) {
				skipApplyRef.current = false;
				setHtmlCode(newVal);
				return;
			}
			setHtmlCode(newVal);
			if (editor) loadHtmlIntoEditor(editor, newVal);
		},
		[editor, setHtmlCode],
	);

	const handleFormat = useCallback(() => {
		skipApplyRef.current = true;
		setHtmlCode(prettyPrintHtml(htmlCode));
		toast.success("HTML formatted");
	}, [htmlCode, setHtmlCode]);

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
				<div className="flex items-center gap-1.5">
					<Icon name="code" className="h-3.5 w-3.5 text-text-sub-600" />
					<span className="font-semibold text-label-xs text-text-strong-950">
						HTML
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						onClick={handleFormat}
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
						disabled={!htmlCode}
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
					style={{ fontSize: "12px", height: "100%", width: "100%" }}
					className="h-full w-full font-mono"
				/>
			</div>
		</div>
	);
}
