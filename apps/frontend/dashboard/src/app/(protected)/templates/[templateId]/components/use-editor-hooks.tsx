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

/**
 * Wraps a WebsocketProvider's awareness so that CollaborationCaret never
 * sees null states during unmount. Yjs sets remote states to `null` when a
 * peer disconnects; if CollaborationCaret tries to read `.cursor.type` from
 * a null state it throws "Cannot read properties of undefined (reading 'type')".
 *
 * This proxy intercepts `getStates()` and strips any null/undefined entries
 * before they reach the caret plugin.
 */
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

export const useEditorHook = (collab?: CollabOptions) => {
	const editor = useEditor(
		{
			extensions: [
				// Disable UndoRedo when collab is active — Yjs handles undo/redo
				StarterKit.configure(collab ? { UndoRedo: false } : {}),
				...baseExtensions,
				...(collab
					? [
							// Collaboration v3 accepts `provider` directly
							Collaboration.configure({
								document: collab.ydoc,
								field: "email-content",
								provider: collab.provider,
							}),
							// Use a safe awareness proxy to prevent CollaborationCaret from
							// crashing on null states that appear during provider teardown.
							CollaborationCaret.configure({
								provider: {
									awareness: makeSafeAwarenessProxy(collab.provider),
								},
								user: collab.user,
							}),
						]
					: []),
			],
			immediatelyRender: false,
			onContentError(e) {
				console.error("[editor] content error", e);
			},
		},
		[collab?.ydoc, collab?.provider],
	);

	return editor;
};
