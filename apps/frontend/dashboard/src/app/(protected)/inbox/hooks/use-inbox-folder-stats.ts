"use client";

import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import { filterInboxThreads } from "@fe/dashboard/app/(protected)/inbox/utils/inbox-folder-filters";
import { groupThreadsByConversation } from "@fe/dashboard/app/(protected)/inbox/utils/group-threads";
import { useMemo } from "react";

export type InboxFolderStats = {
	inbox: number;
	agent: number;
	drafts: number;
	sent: number;
	archive: number;
	snoozed: number;
	spam: number;
	bin: number;
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
			snoozed: 0,
			spam: mailboxThreads.filter(
				(t) => t.direction === "inbound" && t.status === "blocked",
			).length,
			bin: 0,
		};
	}, [threads, archivedThreads, mailboxId]);
};
