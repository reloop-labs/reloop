"use client";

import { AgentInboxContent } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-content";
import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import type { InboundThread } from "@fe/dashboard/app/(protected)/inbox/types";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function AgentInboxTrashPage() {
	const params = useParams<{ mailboxId: string }>();
	const mailboxId = params.mailboxId;
	const { getMailbox } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	const filteredThreads = useMemo<InboundThread[]>(() => {
		return [];
	}, []);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="trash"
			threads={filteredThreads}
		/>
	);
}
