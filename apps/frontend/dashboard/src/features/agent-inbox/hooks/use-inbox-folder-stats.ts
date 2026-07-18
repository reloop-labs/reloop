import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { groupThreadsByConversation } from "#/features/agent-inbox/utils/group-threads";
import { filterInboxThreads } from "#/features/agent-inbox/utils/inbox-folder-filters";
import { useMemo } from "react";

export type InboxFolderStats = {
	inbox: number;
	agent: number;
	drafts: number;
	sent: number;
	archive: number;
	spam: number;
	trash: number;
};

export const useInboxFolderStats = (mailboxId: string): InboxFolderStats => {
	const { threads, archivedThreads } = useAgentInbox();

	return useMemo(() => {
		const mailboxThreads = threads.filter((t) => t.mailboxId === mailboxId);
		const mailboxArchived = archivedThreads.filter(
			(t) => t.mailboxId === mailboxId,
		);

		return {
			inbox: groupThreadsByConversation(
				filterInboxThreads(mailboxThreads, mailboxId),
			).length,
			agent: groupThreadsByConversation(
				mailboxThreads.filter(
					(t) => t.direction === "inbound" && t.status === "handled",
				),
			).length,
			drafts: mailboxThreads.filter(
				(t) =>
					t.direction === "inbound" &&
					(t.status === "needs_approval" || t.status === "parsing"),
			).length,
			sent: mailboxThreads.filter((t) => t.direction === "outbound").length,
			archive: mailboxArchived.length,
			spam: mailboxThreads.filter(
				(t) => t.direction === "inbound" && t.status === "blocked",
			).length,
			trash: 0,
		};
	}, [threads, archivedThreads, mailboxId]);
};
