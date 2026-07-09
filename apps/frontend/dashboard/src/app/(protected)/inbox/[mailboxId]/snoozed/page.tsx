"use client";

import { AgentInboxContent } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-content";
import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import { useParams } from "next/navigation";

export default function AgentInboxSnoozedPage() {
	const params = useParams<{ mailboxId: string }>();
	const mailboxId = params.mailboxId;
	const { getMailbox, snoozedThreads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	if (!mailbox) return null;

	const filtered = snoozedThreads.filter((t) => t.mailboxId === mailboxId);

	return (
		<AgentInboxContent mailbox={mailbox} folder="snoozed" threads={filtered} />
	);
}
