"use client";

import { AgentInboxPage } from "#/features/agent-inbox/agent-inbox-page";
import { AgentInboxProvider } from "#/features/agent-inbox/components/agent-inbox-provider";

export function AgentInboxRouteClient() {
	return (
		<AgentInboxProvider>
			<AgentInboxPage />
		</AgentInboxProvider>
	);
}
