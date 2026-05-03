"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	BubbleMenu,
	defaultSlashCommands,
	SlashCommand,
} from "@react-email/editor/ui";
import { EditorContext } from "@tiptap/react";
import { useRef } from "react";
import { CollabPresence } from "./collobration/Collabpresence";
import { ConnectionStatus } from "./collobration/ConnectionStatus";
import {
	getRandomColor,
	useCollaboration,
} from "./collobration/hooks/useCollaboration";
import { PresenceProvider } from "./collobration/PresenceProvider";
import { useMousePresence } from "./cursor/hooks/useMousePresence";
import { useRemoteCursors } from "./cursor/hooks/useRemoteCursors";
import { RemoteCursors } from "./cursor/RemoteCursors";
import { useEditorHook } from "./use-editor-hooks";

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

	const { ydoc, provider, connectionStatus, isSynced } = useCollaboration({
		roomName: roomId,
		user: collabUser,
	});
	const containerRef = useRef<HTMLDivElement>(null);

	useMousePresence(provider, containerRef);
	const remoteCursors = useRemoteCursors(provider);

	const editor = useEditorHook(
		ydoc && provider ? { ydoc, provider, user: collabUser } : undefined,
	);

	return (
		<PresenceProvider awareness={provider?.awareness ?? null}>
			<EditorContext.Provider value={{ editor }}>
				<div ref={containerRef} className="relative h-full">
					{/* ── Collab header bar ──────────────────────────────────────── */}
					<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-white-0 px-4 py-2 dark:bg-[#0a0a0a]">
						<CollabPresence />
						<ConnectionStatus status={connectionStatus} isSynced={isSynced} />
					</div>
					<RemoteCursors cursors={remoteCursors} />
					{children}

					<BubbleMenu
						hideWhenActiveNodes={["button"]}
						hideWhenActiveMarks={["link"]}
					/>
					<BubbleMenu.LinkDefault />
					<BubbleMenu.ButtonDefault />
					<SlashCommand items={defaultSlashCommands} />
				</div>
			</EditorContext.Provider>
		</PresenceProvider>
	);
};
