import { useCurrentEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef } from "react";
import { getRenderedEmailHtml } from "#/features/templates/editor/utils/get-rendered-email-html";
import { useEditorStore } from "./use-editor-store";
import { useTemplateId } from "./use-template-id";

const AUTOSAVE_MS = 1500;
const SKIP_HYDRATE_MS = 2500;

/**
 * Debounced autosave of the template draft (content and email meta) while the
 * editor is open. Saves are skipped during publishing or AI generation and
 * replayed once that ends, and flushed when the tab is hidden.
 */
export function useAutoSaveDraft(): void {
	const templateId = useTemplateId();
	const { editor } = useCurrentEditor();
	const skipUntilRef = useRef(Date.now() + SKIP_HYDRATE_MS);
	const inFlightRef = useRef(false);
	const pendingRef = useRef(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const saveRef = useRef<() => Promise<void>>(async () => {});
	const skipNextMetaRef = useRef(true);
	// Set when a save was skipped because a publish/generation was running, so
	// it can be replayed afterwards instead of being dropped.
	const skippedWhileBusyRef = useRef(false);

	saveRef.current = async () => {
		if (!editor || !templateId) return;
		const state = useEditorStore.getState();
		if (state.isGenerating || state.isPublishing) {
			skippedWhileBusyRef.current = true;
			return;
		}
		if (Date.now() < skipUntilRef.current) return;

		if (inFlightRef.current) {
			pendingRef.current = true;
			return;
		}

		inFlightRef.current = true;
		state.setIsSavingDraft(true);
		try {
			const content = editor.getJSON().content ?? [];
			// Lets the list thumbnail show the draft before the first publish.
			const renderedHtml = await getRenderedEmailHtml(
				editor,
				state.previewText,
			).catch(() => undefined);
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
					renderedHtml,
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
			timerRef.current = null;
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
			// Flush instead of dropping a pending save when leaving the editor
			// (client-side navigation doesn't fire visibilitychange).
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
				void saveRef.current();
			}
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

	// Replay a save skipped during publish/generation once it ends. Always
	// replay: a failed publish leaves the edits unsaved, and a successful one
	// only synced the content captured when it started.
	useEffect(() => {
		return useEditorStore.subscribe((state, prev) => {
			const wasBusy = prev.isPublishing || prev.isGenerating;
			const isBusy = state.isPublishing || state.isGenerating;
			if (!wasBusy || isBusy || !skippedWhileBusyRef.current) return;
			skippedWhileBusyRef.current = false;
			schedule();
		});
	}, [schedule]);

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
