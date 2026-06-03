"use client";

import * as Drawer from "@reloop/ui/drawer";
import type { AgentMailbox, InboundThread } from "../mock-data";
import { ThreadDetail } from "./thread-detail";

interface ThreadDrawerProps {
	thread: InboundThread | null;
	mailbox: AgentMailbox | undefined;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export const ThreadDrawer = ({
	thread,
	mailbox,
	isOpen,
	onOpenChange,
}: ThreadDrawerProps) => {
	return (
		<Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
			<Drawer.Content className="max-w-full sm:max-w-[480px]">
				<Drawer.Header className="border-stroke-soft-200 border-b">
					<Drawer.Title>{thread?.subject ?? "Message"}</Drawer.Title>
				</Drawer.Header>
				<Drawer.Body className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
					<ThreadDetail
						thread={thread}
						mailbox={mailbox}
						onBack={() => onOpenChange(false)}
						showBack
					/>
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
