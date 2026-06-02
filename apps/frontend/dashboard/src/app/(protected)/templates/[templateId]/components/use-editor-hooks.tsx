import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming, useEditorImage } from "@react-email/editor/plugins";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { useCallback } from "react";
import type { WebsocketProvider } from "y-websocket";
import type * as Y from "yjs";
import { Variable } from "./extensions/variable";
import { VariableSuggestion } from "./extensions/variable-suggestion";

export interface CollabOptions {
	ydoc: Y.Doc;
	provider: WebsocketProvider | null;
	user: { name?: string; color: string; avatar?: string; email?: string };
}

const baseExtensions = [
	EmailTheming,
	Placeholder.configure({
		placeholder: "Press '/' for commands...",
		showOnlyWhenEditable: true,
		includeChildren: true,
	}),
];

function makeSafeAwarenessProxy(provider: WebsocketProvider) {
	const real = provider.awareness;
	return new Proxy(real, {
		get(target, prop) {
			if (prop === "getStates") {
				return () => {
					const states = target.getStates();
					const safe = new Map<number, Record<string, unknown>>();
					states.forEach((state, clientId) => {
						if (state != null) safe.set(clientId, state);
					});
					return safe;
				};
			}
			const val = (target as unknown as Record<string | symbol, unknown>)[
				prop as string
			];
			return typeof val === "function" ? val.bind(target) : val;
		},
	});
}

export const useEditorHook = (collab: CollabOptions) => {
	const collabExtensions =
		collab.provider && collab.ydoc
			? [
					Collaboration.configure({
						document: collab.ydoc,
						field: "email-content",
						provider: collab.provider,
					}),
					CollaborationCaret.configure({
						provider: {
							awareness: makeSafeAwarenessProxy(collab.provider),
						},
						user: {
							name: collab.user.name || collab.user.email || "Anonymous",
							color: collab.user.color,
							avatar: collab.user.avatar,
						},
					}),
				]
			: [];

	const uploadImage = useCallback(async (file: File) => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch("/api/upload/v1/upload", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			const errText = await response.text();
			console.error("[useEditorHook] Upload error:", errText);
			throw new Error("Failed to upload image");
		}

		const data = await response.json();
		return { url: data.url };
	}, []);

	const imageExtension = useEditorImage({ uploadImage });

	const editor = useEditor(
		{
			extensions: [
				StarterKit.configure({ UndoRedo: false }),
				...baseExtensions,
				Variable,
				VariableSuggestion as any,
				imageExtension,
				...collabExtensions,
			] as any[],
			immediatelyRender: false,
			onContentError(e) {
				console.error("[editor] content error", e);
			},
		},
		[collab.provider, collab.ydoc],
	);

	return editor;
};
