"use client";

import type { ReactNode } from "react";
import { Provider as JotaiProvider } from "jotai";
import { AgentInboxProvider } from "./components/agent-inbox-provider";
import { InboxHotkeysProvider } from "./components/inbox-hotkeys-provider";
import { InboxSidebarProvider } from "./components/inbox-sidebar-context";
import "./inbox.css";

export default function AgentInboxSectionLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="inbox-zero-theme dark fixed inset-0 z-40">
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
