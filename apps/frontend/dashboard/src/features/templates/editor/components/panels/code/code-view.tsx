import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { generateJSON } from "@tiptap/html";
import { useCurrentEditor } from "@tiptap/react";
import { xcodeDark } from "@uiw/codemirror-theme-xcode";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { applyPastedEmailTheme } from "#/features/templates/editor/utils/apply-pasted-email-theme";
import { getRenderedEmailHtml } from "#/features/templates/editor/utils/get-rendered-email-html";
import { withoutSourceUnlock } from "#/features/templates/editor/utils/html-source-lock";
import { isFullEmailHtml } from "#/features/templates/editor/utils/pick-pasted-email-html";
import { prettyPrintHtml } from "#/features/templates/editor/utils/pretty-print-html";
import { sanitizeEmailHtml } from "#/features/templates/editor/utils/sanitize-email-html";

export function CodeEditor({ onClose }: { onClose?: () => void } = {}) {
	const { editor } = useCurrentEditor();
	const htmlCode = useEditorStore((s) => s.codeHtml);
	const setHtmlCode = useEditorStore((s) => s.setCodeHtml);
	const setHtmlLocked = useEditorStore((s) => s.setHtmlLocked);
	const [isLoading, setIsLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingCodeRef = useRef<string | null>(null);

	// Visual → code. While the canvas is the source of truth (not locked),
	// the code view always mirrors it, including edits made after the view
	// was first opened.
	const composeFromCanvas = useCallback(async () => {
		if (!editor) return;
		if (useEditorStore.getState().htmlLocked) return;
		setIsLoading(true);
		try {
			const html = await getRenderedEmailHtml(editor);
			// The user may have started typing code while this was composing.
			if (!useEditorStore.getState().htmlLocked) setHtmlCode(html);
		} catch (err) {
			console.error("Failed to compose React Email HTML:", err);
			toast.error("Failed to generate email HTML");
		} finally {
			setIsLoading(false);
		}
	}, [editor, setHtmlCode]);

	useEffect(() => {
		if (!editor) return;
		void composeFromCanvas();
		let timer: ReturnType<typeof setTimeout> | null = null;
		const onUpdate = () => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => void composeFromCanvas(), 250);
		};
		editor.on("update", onUpdate);
		return () => {
			if (timer) clearTimeout(timer);
			editor.off("update", onUpdate);
		};
	}, [editor, composeFromCanvas]);

	// Code → visual. The code is authoritative once typed in (locked), and is
	// parsed into the canvas after a pause rather than on every keystroke, so
	// half-typed tags never tear the document apart. `emitUpdate` stays on so
	// autosave and the unsaved-changes indicator see the change.
	//
	// `generateJSON` runs the HTML through the editor's own schema (the same
	// path TipTap paste uses), mapping presentation tables to containers,
	// react-email buttons, images, links and styled spans to their nodes.
	const applyCodeToCanvas = useCallback(() => {
		if (applyTimerRef.current) {
			clearTimeout(applyTimerRef.current);
			applyTimerRef.current = null;
		}
		const code = pendingCodeRef.current;
		pendingCodeRef.current = null;
		if (code === null || !editor || editor.isDestroyed) return;
		try {
			const isFullHtml = isFullEmailHtml(code);
			const content = isFullHtml
				? generateJSON(
						sanitizeEmailHtml(code),
						editor.extensionManager.extensions as never,
					)
				: code;
			withoutSourceUnlock(() => {
				editor.commands.setContent(content);
			});
			if (isFullHtml) applyPastedEmailTheme(editor, code);
		} catch (err) {
			console.error("Failed to set content from HTML code editor:", err);
		}
	}, [editor]);

	// Flush on close so leaving the code view never drops the last edit.
	useEffect(() => applyCodeToCanvas, [applyCodeToCanvas]);

	const handleCodeChange = useCallback(
		(newVal: string) => {
			setHtmlLocked(true);
			setHtmlCode(newVal);
			pendingCodeRef.current = newVal;
			if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
			applyTimerRef.current = setTimeout(applyCodeToCanvas, 600);
		},
		[applyCodeToCanvas, setHtmlCode, setHtmlLocked],
	);

	// Formatting only changes whitespace, so it does not touch the canvas or
	// the lock. CodeMirror does not fire onChange for this external update.
	const handleFormat = useCallback(() => {
		setHtmlCode(prettyPrintHtml(htmlCode));
		toast.success("HTML formatted");
	}, [htmlCode, setHtmlCode]);

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
