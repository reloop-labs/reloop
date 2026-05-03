import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
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
				// When collab is active, disable UndoRedo — Yjs handles undo/redo natively
				StarterKit.configure(
					collab ? { UndoRedo: false } : {},
				),
				...baseExtensions,
				...(collab
					? [
							Collaboration.configure({
								document: collab.ydoc,
								field: "email-content",
							}),
							CollaborationCursor.configure({
								provider: collab.provider,
								user: { name: collab.user.name, color: collab.user.color },
								render: (user: { name: string; color: string }) => {
									const cursorEl = document.createElement("span");
									cursorEl.classList.add("collab-cursor");
									cursorEl.style.setProperty("--cursor-color", user.color);

									const caretEl = document.createElement("span");
									caretEl.classList.add("collab-cursor__caret");

									const labelEl = document.createElement("span");
									labelEl.classList.add("collab-cursor__label");
									labelEl.textContent = user.name;
									labelEl.style.backgroundColor = user.color;

									cursorEl.appendChild(caretEl);
									cursorEl.appendChild(labelEl);
									return cursorEl;
								},
							}),
						]
					: []),
			],
			immediatelyRender: false,
		},
		// Re-initialise editor once the Yjs doc + WS provider are ready
		[collab?.ydoc, collab?.provider],
	);

	return editor;
};
