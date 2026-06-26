"use client";

import { AgentInboxContent } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-content";
import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function AgentInboxMailboxPage() {
	const params = useParams<{ mailboxId: string }>();
	const mailboxId = params.mailboxId;
	const { getMailbox, threads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	const filteredThreads = useMemo(() => {
		return threads.filter(
			(t) =>
				t.mailboxId === mailboxId &&
				t.direction === "inbound" &&
				t.status !== "blocked",
		);
	}, [threads, mailboxId]);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="inbox"
			threads={filteredThreads}
		/>
	);
}
