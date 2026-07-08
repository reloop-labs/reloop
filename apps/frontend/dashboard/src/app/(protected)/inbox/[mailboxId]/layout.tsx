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
		if (!pathname || !mailboxId) return "inbox";
		const base = `/inbox/${mailboxId}`;
		if (pathname === base) return "inbox";
		const suffix = pathname.slice(base.length + 1);
		if (suffix.startsWith("label/")) {
			const labelId = suffix.split("/")[1];
			return labelId ? `label:${labelId}` : "inbox";
		}
		return suffix.split("/")[0] || "inbox";
	}, [pathname, mailboxId]);

	if (isLoadingMailboxes) {
		return (
			<>
				<AgentInboxSkeleton />
				<div style={{ display: "none" }}>{children}</div>
			</>
		);
	}

	if (!mailbox) {
		return (
			<>
				<AgentMailboxNotFound />
				<div style={{ display: "none" }}>{children}</div>
			</>
		);
	}

	return (
		<AgentInboxLayoutWrapper mailbox={mailbox} folder={folder}>
			{children}
		</AgentInboxLayoutWrapper>
	);
}
