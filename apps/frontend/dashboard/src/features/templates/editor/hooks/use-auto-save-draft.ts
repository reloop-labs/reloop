import { useCurrentEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "./use-editor-store";
import { useTemplateId } from "./use-template-id";

const AUTOSAVE_MS = 1500;
const SKIP_HYDRATE_MS = 2500;

export function useAutoSaveDraft() {
	const templateId = useTemplateId();
	const { editor } = useCurrentEditor();
	const skipUntilRef = useRef(Date.now() + SKIP_HYDRATE_MS);
	const inFlightRef = useRef(false);
	const pendingRef = useRef(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const saveRef = useRef<() => Promise<void>>(async () => {});
	const skipNextMetaRef = useRef(true);

	saveRef.current = async () => {
		if (!editor || !templateId) return;
		const state = useEditorStore.getState();
		if (state.isGenerating || state.isPublishing) return;
		if (Date.now() < skipUntilRef.current) return;

		if (inFlightRef.current) {
			pendingRef.current = true;
			return;
		}

		inFlightRef.current = true;
		state.setIsSavingDraft(true);
		try {
			const content = editor.getJSON().content ?? [];
			const response = await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					content,
					subject: state.subject,
					fromEmail: state.fromEmail,
					replyTo: state.replyTo,
					previewText: state.previewText,
				}),
			});
			if (response.ok) {
				useEditorStore.getState().setLastSaved(null, new Date());
			}
		} catch (error) {
			console.error("Failed to auto-save draft:", error);
		} finally {
			inFlightRef.current = false;
			useEditorStore.getState().setIsSavingDraft(false);
			if (pendingRef.current) {
				pendingRef.current = false;
				void saveRef.current();
			}
		}
	};

	const schedule = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			void saveRef.current();
		}, AUTOSAVE_MS);
	}, []);

	useEffect(() => {
		if (!editor) return;
		const onUpdate = () => {
			const store = useEditorStore.getState();
			if (!store.hasUnsavedChanges) store.setHasUnsavedChanges(true);
			schedule();
		};
		editor.on("update", onUpdate);
		return () => {
			editor.off("update", onUpdate);
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [editor, schedule]);

	const subject = useEditorStore((s) => s.subject);
	const fromEmail = useEditorStore((s) => s.fromEmail);
	const replyTo = useEditorStore((s) => s.replyTo);
	const previewText = useEditorStore((s) => s.previewText);

	useEffect(() => {
		if (skipNextMetaRef.current) {
			skipNextMetaRef.current = false;
			return;
		}
		if (Date.now() < skipUntilRef.current) return;
		const store = useEditorStore.getState();
		if (!store.hasUnsavedChanges) store.setHasUnsavedChanges(true);
		schedule();
	}, [subject, fromEmail, replyTo, previewText, schedule]);

	useEffect(() => {
		const flush = () => {
			if (document.visibilityState === "hidden") {
				void saveRef.current();
			}
		};
		document.addEventListener("visibilitychange", flush);
		return () => document.removeEventListener("visibilitychange", flush);
	}, []);
}
