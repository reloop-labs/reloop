import { composeReactEmail } from "@react-email/editor/core";
import { EmailTheming, useEditorImage } from "@react-email/editor/plugins";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef } from "react";
import { UnsubscribeLink } from "../extensions/unsubscribe-link";
import { Variable } from "../extensions/variable";
import { VariableSuggestion } from "../extensions/variable-suggestion";
import { applySourceHtml } from "../utils/apply-source-html";
import { emailStarterKit } from "../utils/email-starter-kit";
import { pickPastedEmailHtml } from "../utils/pick-pasted-email-html";
import { readImageFileAsDataUrl } from "../utils/read-image-file";
import { useEditorStore } from "./use-editor-store";

const COMPOSE_DEBOUNCE_MS = 250;

/**
 * Dashboard `useEditorHook` without collaboration or uploads. Canvas edits
 * compose back into the HTML source so the code view stays in sync.
 */
export function useToolEditor() {
	const editorRef = useRef<Editor | null>(null);
	const composeTimer = useRef<number | null>(null);

	const uploadImage = useCallback(async (file: File) => {
		return { url: await readImageFileAsDataUrl(file) };
	}, []);

	const imageExtension = useEditorImage({ uploadImage });

	const scheduleCompose = useCallback((editor: Editor) => {
		if (composeTimer.current) window.clearTimeout(composeTimer.current);
		composeTimer.current = window.setTimeout(async () => {
			try {
				const result = await composeReactEmail({ editor });
				const store = useEditorStore.getState();
				// Source edits lock the HTML again while they are applied.
				if (store.htmlLocked) return;
				store.setCodeHtml(result.html);
			} catch (err) {
				console.error("Failed to compose email HTML:", err);
			}
		}, COMPOSE_DEBOUNCE_MS);
	}, []);

	const editor = useEditor(
		{
			editorProps: {
				attributes: {
					class: "tiptap focus:outline-none",
				},
				handlePaste: (_view, event) => {
					const editor = editorRef.current;
					if (!editor || event.clipboardData?.files?.[0]) return false;
					const html = pickPastedEmailHtml(
						event.clipboardData?.getData("text/html") || "",
						event.clipboardData?.getData("text/plain") || "",
					);
					if (!html) return false;
					event.preventDefault();
					return applySourceHtml(editor, html);
				},
			},
			extensions: [
				emailStarterKit(),
				EmailTheming,
				Placeholder.configure({
					placeholder: "Press / for commands...",
					showOnlyWhenEditable: true,
					includeChildren: true,
				}),
				UnsubscribeLink,
				Variable,
				VariableSuggestion as any,
				imageExtension,
			] as any[],
			immediatelyRender: false,
			onUpdate({ editor: next, transaction }) {
				// Template init and code view edits run under applyingFromSource;
				// anything else is a canvas or inspector edit.
				if (!transaction.docChanged) return;
				if (useEditorStore.getState().applyingFromSource) return;
				useEditorStore.getState().setHtmlLocked(false);
				scheduleCompose(next);
			},
			onContentError(e) {
				console.error("[editor] content error", e);
			},
		},
		[],
	);

	editorRef.current = editor;

	useEffect(() => {
		return () => {
			if (composeTimer.current) window.clearTimeout(composeTimer.current);
		};
	}, []);

	return editor;
}
