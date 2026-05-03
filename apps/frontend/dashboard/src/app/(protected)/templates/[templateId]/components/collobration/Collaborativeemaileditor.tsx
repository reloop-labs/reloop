"use client";

import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-caret";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef } from "react";
import type { Doc } from "yjs";
import { useMousePresence } from "../cursor/hooks/useMousePresence";
import { useRemoteCursors } from "../cursor/hooks/useRemoteCursors";
import { RemoteCursors } from "../cursor/RemoteCursors";
import { CollabPresence } from "./Collabpresence";
import { CollabToolbar } from "./Collabtoolbar";
import { ConnectionStatus } from "./ConnectionStatus";
import {
	type CollabUser,
	getRandomColor,
	useCollaboration,
} from "./hooks/useCollaboration";
export interface CollaborativeEmailEditorProps {
	/** Unique document identifier — users on same roomId share the doc */
	roomId: string;
	/** Current user info */
	currentUser: {
		id: string;
		name: string;
		avatar?: string;
	};
	/** Called with the TipTap JSON content on autosave (debounced 1s) */
	onSave?: (content: Record<string, unknown>) => Promise<void>;
	/** Initial content to populate if doc is empty */
	initialContent?: Record<string, unknown>;
	/** Placeholder text in empty editor */
	placeholder?: string;
	/** Override WebSocket server URL */
	wsUrl?: string;
	className?: string;
}

export function CollaborativeEmailEditor({
	roomId,
	currentUser,
	onSave,
	initialContent,
	placeholder = "Start writing your email...",
	wsUrl,
	className = "",
}: CollaborativeEmailEditorProps) {
	// Derive stable user object
	const user: CollabUser = {
		name: currentUser.name,
		color: getRandomColor(currentUser.id),
		avatar: currentUser.avatar,
	};

	const {
		ydoc,
		provider,
		isConnected,
		isSynced,
		awarenessUsers,
		connectionStatus,
	} = useCollaboration({
		roomName: roomId,
		serverUrl: wsUrl,
		user,
		onUpdate: useCallback(
			async (doc: Doc) => {
				if (!onSave) return;
				console.log("hello", doc);
			},
			[onSave],
		),
	});

	const containerRef = useRef<HTMLDivElement>(null);
	useMousePresence(provider, containerRef);

	const editor = useEditor(
		{
			extensions: [
				// Remove history — Yjs handles undo/redo
				StarterKit.configure({
					// Keep all other extensions
					heading: { levels: [1, 2, 3] },
				}),
				Underline,
				Link.configure({
					openOnClick: false,
					HTMLAttributes: { rel: "noopener noreferrer" },
				}),
				Placeholder.configure({ placeholder }),

				// ─── Collaboration extensions ───────────────────────────────
				// These two require ydoc to be ready
				...(ydoc && provider
					? [
							Collaboration.configure({
								document: ydoc,
								// The XML fragment name within the Yjs doc
								field: "email-content",
							}),
							CollaborationCursor.configure({
								provider,
								user: { name: user.name, color: user.color },
							}),
						]
					: []),
			],

			editorProps: {
				attributes: {
					class: "collab-editor prose max-w-none focus:outline-none",
					spellcheck: "true",
				},
			},

			onUpdate: ({ editor }) => {
				if (!onSave) return;
				const json = editor.getJSON();
				onSave(json).catch(console.error);
			},
		},
		// Re-initialize editor when ydoc/provider become available
		[ydoc, provider],
	);
	const remoteCursors = useRemoteCursors(provider);

	// Populate initial content if doc is empty and not yet synced
	useEffect(() => {
		if (!editor || !initialContent || isSynced) return;
		const hasContent =
			editor.getHTML() !== "<p></p>" && editor.getText().length > 0;
		if (!hasContent) {
			editor.commands.setContent(initialContent);
		}
	}, [editor, initialContent, isSynced]);

	if (!ydoc || !provider) {
		return (
			<div className="flex h-64 items-center justify-center text-gray-400">
				<div className="animate-pulse">Initializing collaboration...</div>
			</div>
		);
	}

	return (
		<div className={`collab-email-editor flex h-full flex-col ${className}`}>
			{/* Header: presence + connection status */}
			<div className="flex items-center justify-between border-gray-200 border-b bg-white px-4 py-2">
				<CollabPresence />
				<ConnectionStatus status={connectionStatus} isSynced={isSynced} />
			</div>
			<div ref={containerRef} className="relative h-full w-full" />
			<RemoteCursors cursors={remoteCursors} />
			{editor && <CollabToolbar editor={editor} />}
			<div className="flex-1 overflow-auto bg-white">
				<div className="mx-auto max-w-3xl px-8 py-10">
					<EditorContent editor={editor} className="min-h-[500px]" />
				</div>
			</div>
		</div>
	);
}
