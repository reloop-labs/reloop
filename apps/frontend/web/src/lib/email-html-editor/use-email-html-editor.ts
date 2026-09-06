import { composeReactEmail } from "@react-email/editor/core";
import { EmailTheming, useEditorImage } from "@react-email/editor/plugins";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef } from "react";
import { emailStarterKit } from "./email-starter-kit";
import { handleEmailHtmlPaste } from "./load-html-into-editor";
import { useEmailHtmlEditorStore } from "./store";

const COMPOSE_DEBOUNCE_MS = 250;

export function useEmailHtmlEditor() {
	const editorRef = useRef<Editor | null>(null);
	const composeTimer = useRef<number | null>(null);

	const uploadImage = useCallback(async (file: File) => {
		return { url: URL.createObjectURL(file) };
	}, []);

	const imageExtension = useEditorImage({ uploadImage });

	const scheduleCompose = useCallback((editor: Editor) => {
		if (useEmailHtmlEditorStore.getState().applyingFromSource) return;
		if (composeTimer.current) window.clearTimeout(composeTimer.current);
		composeTimer.current = window.setTimeout(async () => {
			if (useEmailHtmlEditorStore.getState().applyingFromSource) return;
			try {
				const result = await composeReactEmail({ editor });
				if (useEmailHtmlEditorStore.getState().applyingFromSource) return;
				useEmailHtmlEditorStore.getState().setCodeHtml(result.html);
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
				handlePaste: (_view, event) =>
					handleEmailHtmlPaste(editorRef.current, event),
			},
			extensions: [
				emailStarterKit(),
				EmailTheming,
				Placeholder.configure({
					placeholder: "Paste email HTML or press / for commands…",
					showOnlyWhenEditable: true,
					includeChildren: true,
				}),
				imageExtension,
			] as any[],
			immediatelyRender: false,
			onUpdate({ editor: next }) {
				scheduleCompose(next);
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
