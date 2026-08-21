import { InboxSupportPanel } from "#/features/agent-inbox/components/layout/inbox-support-panel";
import { InboxTopNavbar } from "#/features/agent-inbox/components/layout/inbox-top-navbar";
import { InboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar";
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
		<div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-panel-light text-mail-foreground dark:bg-panel-dark">
			<InboxTopNavbar mailbox={mailbox} />
			<div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
				<InboxSidebar mailbox={mailbox} folder={folder} />
				<div className="relative z-[5] flex min-h-0 min-w-0 flex-1 overflow-hidden">
					{children}
				</div>
				<InboxSupportPanel />
			</div>
		</div>
	);
};
