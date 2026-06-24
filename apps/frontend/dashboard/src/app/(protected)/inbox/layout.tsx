"use client";

import type { ReactNode } from "react";
import { AgentInboxProvider } from "./components/agent-inbox-provider";

export default function AgentInboxSectionLayout({
	children,
}: {
	children: ReactNode;
}) {
	return <AgentInboxProvider>{children}</AgentInboxProvider>;
}
