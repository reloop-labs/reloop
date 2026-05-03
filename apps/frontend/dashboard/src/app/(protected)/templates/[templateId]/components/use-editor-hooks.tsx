import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import Collaboration from "@tiptap/extension-collaboration";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import type { WebsocketProvider } from "y-websocket";
import type * as Y from "yjs";

export interface CollabOptions {
	ydoc: Y.Doc;
	provider: WebsocketProvider;
	user: { name: string; color: string };
}

const baseExtensions = [
	EmailTheming,
	Placeholder.configure({
		placeholder: "Press '/' for commands...",
		showOnlyWhenEditable: true,
		includeChildren: true,
	}),
];

export const useEditorHook = (collab?: CollabOptions) => {
	const editor = useEditor(
		{
			extensions: [
				// Disable UndoRedo when collab is active — Yjs handles undo/redo
				StarterKit.configure(collab ? { UndoRedo: false } : {}),
				...baseExtensions,
				...(collab
					? [
							// Collaboration v3 accepts `provider` directly — no need for the
							// v2 CollaborationCursor extension (incompatible plugin keys).
							Collaboration.configure({
								document: collab.ydoc,
								field: "email-content",
								provider: collab.provider,
							}),
						]
					: []),
			],
			immediatelyRender: false,
			onContentError(e) {
				console.log(e);
			},
		},
		[collab?.ydoc, collab?.provider],
	);

	return editor;
};
