"use client";

import { AgentInboxLayoutWrapper } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-layout-wrapper";
import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import { AgentInboxSkeleton } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-skeleton";
import { AgentMailboxNotFound } from "@fe/dashboard/app/(protected)/inbox/components/agent-mailbox-not-found";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

export default function MailboxLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams<{ mailboxId: string }>();
	const mailboxId = params.mailboxId;
	const pathname = usePathname();
	const { getMailbox, isLoadingMailboxes } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	// Determine current folder from URL path
	const folder = useMemo(() => {
		if (!pathname) return "inbox";
		const parts = pathname.split("/");
		const lastPart = parts[parts.length - 1];
		if (lastPart === mailboxId) {
			return "inbox";
		}
		return lastPart || "inbox";
	}, [pathname, mailboxId]);

	if (isLoadingMailboxes) {
		return <AgentInboxSkeleton />;
	}

	if (!mailbox) {
		return <AgentMailboxNotFound />;
	}

	return (
		<AgentInboxLayoutWrapper mailbox={mailbox} folder={folder}>
			{children}
		</AgentInboxLayoutWrapper>
	);
}
