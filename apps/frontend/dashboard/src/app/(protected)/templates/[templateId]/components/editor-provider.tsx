"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	BubbleMenu,
	defaultSlashCommands,
	SlashCommand,
} from "@react-email/editor/ui";
import { EditorContext } from "@tiptap/react";
import { useRef } from "react";
import {
	getRandomColor,
	useCollaboration,
} from "./collobration/hooks/useCollaboration";
import { PresenceProvider } from "./collobration/PresenceProvider";
import { useMousePresence } from "./cursor/hooks/useMousePresence";
import { useRemoteCursors } from "./cursor/hooks/useRemoteCursors";
import { RemoteCursors } from "./cursor/RemoteCursors";
import { EditorHeaderActions } from "./editor-header-actions";
import { TemplateName } from "./template-name";
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
				<div ref={containerRef} className="bg-bg-weak-50 dark:bg-black">
					<div className="grid grid-cols-3 items-center px-4 pt-2">
						<div />
						<div className="flex justify-center">
							<TemplateName />
						</div>
						<div className="flex items-center justify-end">
							<EditorHeaderActions
								connectionStatus={connectionStatus}
								isSynced={isSynced}
							/>
						</div>
					</div>
					{children}
					<RemoteCursors cursors={remoteCursors} />
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
