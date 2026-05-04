import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
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
	const editor = useEditor({
		extensions: [
			StarterKit.configure({ UndoRedo: false }),
			...baseExtensions,
			Collaboration.configure({
				document: collab.ydoc,
				field: "email-content",
				provider: collab.provider,
			}),
			CollaborationCaret.configure({
				provider: {
					awareness: makeSafeAwarenessProxy(collab.provider),
				},
				user: collab.user,
			}),
		],
		immediatelyRender: false,
		onContentError(e) {
			console.error("[editor] content error", e);
		},
	});

	return editor;
};
