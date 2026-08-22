"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AddAgentAddressModal } from "#/features/agent-inbox/components/add-agent-address-modal";
import { InboxSupportPanel } from "#/features/agent-inbox/components/layout/inbox-support-panel";
import { InboxTopNavbar } from "#/features/agent-inbox/components/layout/inbox-top-navbar";
import { MailboxRail } from "#/features/agent-inbox/components/mailbox-rail/mailbox-rail";
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
	const router = useRouter();
	const [isAddOpen, setIsAddOpen] = useState(false);

	return (
		<div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-panel-light text-mail-foreground dark:bg-panel-dark">
			<InboxTopNavbar mailbox={mailbox} />
			<div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
				<MailboxRail
					activeMailboxId={mailbox.id}
					currentFolder={folder}
					onAddMailbox={() => setIsAddOpen(true)}
				/>
				<InboxSidebar mailbox={mailbox} folder={folder} />
				<div className="relative z-[5] flex min-h-0 min-w-0 flex-1 overflow-hidden">
					{children}
				</div>
				<InboxSupportPanel />
			</div>

			<AddAgentAddressModal
				isOpen={isAddOpen}
				onClose={() => setIsAddOpen(false)}
				onCreated={(created) => {
					toast.success("Mailbox added");
					router.push(`/inbox?mailboxId=${encodeURIComponent(created.id)}`);
				}}
			/>
		</div>
	);
};
