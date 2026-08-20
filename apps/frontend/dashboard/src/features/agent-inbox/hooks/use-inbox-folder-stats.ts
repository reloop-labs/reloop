import { useMemo } from "react";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { useComposeDrafts } from "#/features/agent-inbox/hooks/use-compose-drafts";
import { groupThreadsByConversation } from "#/features/agent-inbox/utils/group-threads";
import { filterInboxThreads } from "#/features/agent-inbox/utils/inbox-folder-filters";

export type InboxFolderStats = {
	inbox: number;
	agent: number;
	drafts: number;
	sent: number;
	archive: number;
	spam: number;
	trash: number;
	starred: number;
};

export const useInboxFolderStats = (mailboxId: string): InboxFolderStats => {
	const { threads, archivedThreads, trashThreads } = useAgentInbox();
	const { count: draftsCount } = useComposeDrafts(mailboxId || undefined);

	return useMemo(() => {
		const mailboxThreads = threads.filter((t) => t.mailboxId === mailboxId);
		const mailboxArchived = archivedThreads.filter(
			(t) => t.mailboxId === mailboxId,
		);
		const mailboxTrash = trashThreads.filter((t) => t.mailboxId === mailboxId);

		return {
			inbox: groupThreadsByConversation(
				filterInboxThreads(mailboxThreads, mailboxId),
			).length,
			agent: groupThreadsByConversation(
				mailboxThreads.filter(
					(t) => t.direction === "inbound" && t.status === "handled",
				),
			).length,
			drafts: draftsCount,
			sent: mailboxThreads.filter((t) => t.direction === "outbound").length,
			archive: mailboxArchived.length,
			spam: mailboxThreads.filter(
				(t) => t.direction === "inbound" && t.status === "blocked",
			).length,
			trash: mailboxTrash.length,
			starred: groupThreadsByConversation(
				mailboxThreads.filter((t) => t.isStarred),
			).length,
		};
	}, [threads, archivedThreads, trashThreads, mailboxId, draftsCount]);
};
