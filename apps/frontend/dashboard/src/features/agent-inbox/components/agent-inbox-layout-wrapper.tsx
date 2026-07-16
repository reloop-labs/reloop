import { InboxSidebar } from "#/features/agent-inbox/components/inbox-sidebar";
import type { AgentMailbox } from "#/features/agent-inbox/types";

export const AgentInboxLayoutWrapper = ({
	mailbox,
	folder,
	children,
}: {
	mailbox: AgentMailbox;
	folder: string;
	children: React.ReactNode;
}) => {
	return (
		<div className="flex h-full min-h-0 w-full overflow-hidden bg-sidebar text-mail-foreground">
			<InboxSidebar mailbox={mailbox} folder={folder} />
			<div className="relative z-[5] flex min-h-0 min-w-0 flex-1 bg-sidebar p-0 md:mt-1 md:mr-0.5">
				{children}
			</div>
		</div>
	);
};
