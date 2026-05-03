"use client";

import {
	BubbleMenu,
	defaultSlashCommands,
	SlashCommand,
} from "@react-email/editor/ui";
import { EditorContext } from "@tiptap/react";
import { CollabPresence } from "./collobration/Collabpresence";
import { ConnectionStatus } from "./collobration/ConnectionStatus";
import {
	getRandomColor,
	useCollaboration,
} from "./collobration/hooks/useCollaboration";
import { useEditorHook } from "./use-editor-hooks";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";

interface EditorProviderProps {
	children: React.ReactNode;
	roomId: string;
}

export const EditorProvider = ({ children, roomId }: EditorProviderProps) => {
	const { user } = useUserOrganization();

	const collabUser = {
		name: user?.name ?? "Anonymous",
		color: getRandomColor(user?.id ?? ""),
		avatar: user?.image ?? undefined,
	};

	const { ydoc, provider, awarenessUsers, connectionStatus, isSynced } =
		useCollaboration({
			roomName: roomId,
			user: collabUser,
		});

	const editor = useEditorHook(
		ydoc && provider ? { ydoc, provider, user: collabUser } : undefined,
	);

	return (
		<EditorContext.Provider value={{ editor }}>
			{/* ── Collab header bar ──────────────────────────────────────── */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-white-0 px-4 py-2 dark:bg-[#0a0a0a]">
				<CollabPresence users={awarenessUsers} currentUserId={user?.id} />
				<ConnectionStatus status={connectionStatus} isSynced={isSynced} />
			</div>

			{children}

			<BubbleMenu
				hideWhenActiveNodes={["button"]}
				hideWhenActiveMarks={["link"]}
			/>
			<BubbleMenu.LinkDefault />
			<BubbleMenu.ButtonDefault />
			<SlashCommand items={defaultSlashCommands} />
		</EditorContext.Provider>
	);
};
