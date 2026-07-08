"use client";

import { AgentInboxContent } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-content";
import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import { useParams } from "next/navigation";

/** Bin — permanently deleted messages (empty until delete-to-bin is supported). */
export default function AgentInboxTrashPage() {
	const params = useParams<{ mailboxId: string }>();
	const mailboxId = params.mailboxId;
	const { getMailbox } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	if (!mailbox) return null;

	return (
		<AgentInboxContent mailbox={mailbox} folder="trash" threads={[]} />
	);
}
