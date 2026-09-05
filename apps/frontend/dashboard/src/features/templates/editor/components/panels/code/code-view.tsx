import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import { composeReactEmail } from "@react-email/editor/core";
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
import { prettyPrintHtml } from "#/features/templates/editor/utils/pretty-print-html";
import { sanitizeEmailHtml } from "#/features/templates/editor/utils/sanitize-email-html";

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
