"use client";

import { AgentInboxPage } from "#/features/agent-inbox/agent-inbox-page";
import AgentInboxSectionLayout from "#/features/agent-inbox/inbox-root-layout";

export function AgentInboxRouteClient() {
	return (
		<AgentInboxSectionLayout>
			<AgentInboxPage />
		</AgentInboxSectionLayout>
	);
}
