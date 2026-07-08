"use client";

import { AgentInboxContent } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-content";
import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import { useInboxLabels } from "@fe/dashboard/app/(protected)/inbox/hooks/use-inbox-labels";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function AgentInboxLabelPage() {
	const params = useParams<{ mailboxId: string; labelId: string }>();
	const mailboxId = params.mailboxId;
	const labelId = params.labelId;
	const { getMailbox, threads } = useAgentInbox();
	const { getThreadIdsForLabel } = useInboxLabels(mailboxId);
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	const filteredThreads = useMemo(() => {
		const assignedIds = new Set(getThreadIdsForLabel(labelId));
		return threads.filter(
			(t) => t.mailboxId === mailboxId && assignedIds.has(t.id),
		);
	}, [threads, mailboxId, labelId, getThreadIdsForLabel]);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder={`label:${labelId}`}
			threads={filteredThreads}
		/>
	);
}
