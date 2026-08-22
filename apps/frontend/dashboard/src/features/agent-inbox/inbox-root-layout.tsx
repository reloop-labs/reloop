import { Provider as JotaiProvider } from "jotai";
import type { ReactNode } from "react";
import { AgentInboxProvider } from "./components/agent-inbox-provider";
import { InboxHotkeysProvider } from "./components/inbox-hotkeys-provider";
import { InboxSidebarProvider } from "./components/sidebar/inbox-sidebar-context";
import "./inbox.css";

export default function AgentInboxSectionLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
			<AgentInboxProvider>
				<JotaiProvider>
					<InboxSidebarProvider>
						<InboxHotkeysProvider>{children}</InboxHotkeysProvider>
					</InboxSidebarProvider>
				</JotaiProvider>
			</AgentInboxProvider>
		</div>
	);
}
