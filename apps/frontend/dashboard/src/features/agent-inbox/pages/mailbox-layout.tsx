import { type ReactNode, useMemo } from "react";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { AgentInboxLayoutWrapper } from "#/features/agent-inbox/components/layout/agent-inbox-layout-wrapper";
import { AgentMailboxNotFound } from "#/features/agent-inbox/components/shared/agent-mailbox-not-found";
import { stubMailbox } from "#/features/agent-inbox/lib/stub-mailbox";
import { useInboxPathname } from "#/features/agent-inbox/lib/use-inbox-path";
import { useMailboxId } from "#/features/agent-inbox/lib/use-mailbox-id";

export function MailboxLayout({ children }: { children: ReactNode }) {
	const mailboxId = useMailboxId();
	const pathname = useInboxPathname();
	const { getMailbox, isLoadingMailboxes, mailboxesError } = useAgentInbox();
	const resolved = mailboxId ? getMailbox(mailboxId) : undefined;

	const folder = useMemo(() => {
		if (!pathname || !mailboxId) return "inbox";
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

	if (!mailboxId) {
		return (
			<>
				<AgentMailboxNotFound />
				<div style={{ display: "none" }}>{children}</div>
			</>
		);
	}

	// Mailboxes finished loading and this id is unknown — keep rail via stub
	// only while loading/error; otherwise show not-found inside the shell.
	const mailboxMissing = !resolved && !isLoadingMailboxes && !mailboxesError;

	const mailbox = resolved ?? stubMailbox(mailboxId);

	return (
		<AgentInboxLayoutWrapper mailbox={mailbox} folder={folder}>
			{mailboxMissing ? <AgentMailboxNotFound /> : children}
		</AgentInboxLayoutWrapper>
	);
}
