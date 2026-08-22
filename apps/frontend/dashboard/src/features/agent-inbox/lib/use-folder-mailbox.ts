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
	const routeMailboxId = useMailboxId();
	const { mailboxes, getMailbox, isLoadingMailboxes, mailboxesError } =
		useAgentInbox();
	const activeMailboxId = routeMailboxId || mailboxes[0]?.id;
	const resolved = activeMailboxId ? getMailbox(activeMailboxId) : undefined;

	if (!activeMailboxId) {
		return { mailboxId: undefined, mailbox: undefined, mailboxReady: false };
	}

	if (!resolved && !isLoadingMailboxes && !mailboxesError) {
		return {
			mailboxId: activeMailboxId,
			mailbox: undefined,
			mailboxReady: false,
		};
	}

	return {
		mailboxId: activeMailboxId,
		mailbox: resolved ?? stubMailbox(activeMailboxId),
		mailboxReady: !!resolved,
	};
}
