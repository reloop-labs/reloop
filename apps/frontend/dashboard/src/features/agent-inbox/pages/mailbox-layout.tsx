import { AgentInboxLayoutWrapper } from "#/features/agent-inbox/components/agent-inbox-layout-wrapper";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { AgentInboxSkeleton } from "#/features/agent-inbox/components/agent-inbox-skeleton";
import { AgentMailboxNotFound } from "#/features/agent-inbox/components/agent-mailbox-not-found";
import { useMailboxId } from "#/features/agent-inbox/lib/use-mailbox-id";
import { useInboxPathname } from "#/features/agent-inbox/lib/use-inbox-path";
import { useMemo, type ReactNode } from "react";

export function MailboxLayout({ children }: { children: ReactNode }) {
	const mailboxId = useMailboxId();
	const pathname = useInboxPathname();
	const { getMailbox, isLoadingMailboxes } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	const folder = useMemo(() => {
		if (!pathname || !mailboxId) return "inbox";
		// Router paths are relative to basepath (/dashboard stripped)
		const base = `/inbox/${mailboxId}`;
		if (pathname === base || pathname === `${base}/`) return "inbox";
		const suffix = pathname.startsWith(base)
			? pathname.slice(base.length + 1)
			: "";
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
