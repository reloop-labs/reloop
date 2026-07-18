import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { stubMailbox } from "#/features/agent-inbox/lib/stub-mailbox";
import { useMailboxId } from "#/features/agent-inbox/lib/use-mailbox-id";
import type { AgentMailbox } from "#/features/agent-inbox/types";

/**
 * Resolves the route mailbox for folder pages. While mailboxes load (or fail),
 * returns a stub so the list/detail shell can still mount.
 */
export function useFolderMailbox(): {
	mailboxId: string | undefined;
	mailbox: AgentMailbox | undefined;
	mailboxReady: boolean;
} {
	const mailboxId = useMailboxId();
	const { getMailbox, isLoadingMailboxes, mailboxesError } = useAgentInbox();
	const resolved = mailboxId ? getMailbox(mailboxId) : undefined;

	if (!mailboxId) {
		return { mailboxId: undefined, mailbox: undefined, mailboxReady: false };
	}

	if (!resolved && !isLoadingMailboxes && !mailboxesError) {
		return { mailboxId, mailbox: undefined, mailboxReady: false };
	}

	return {
		mailboxId,
		mailbox: resolved ?? stubMailbox(mailboxId),
		mailboxReady: !!resolved,
	};
}
