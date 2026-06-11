"use client";

import { useParams } from "next/navigation";
import { AgentInboxLayout } from "../components/agent-inbox-layout";
import { useAgentInbox } from "../components/agent-inbox-provider";
import { AgentInboxSkeleton } from "../components/agent-inbox-skeleton";
import { AgentMailboxNotFound } from "../components/agent-mailbox-not-found";

export default function AgentInboxMailboxPage() {
	const params = useParams<{ mailboxId: string }>();
	const mailboxId = params.mailboxId;
	const { getMailbox, isLoadingMailboxes } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	if (isLoadingMailboxes) {
		return <AgentInboxSkeleton />;
	}

	if (!mailbox) {
		return <AgentMailboxNotFound />;
	}

	return <AgentInboxLayout mailbox={mailbox} />;
}
