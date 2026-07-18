import type { AgentMailbox } from "#/features/agent-inbox/types";

/** Placeholder so the shell can mount before mailboxes resolve. */
export function stubMailbox(id: string): AgentMailbox {
	return {
		id,
		email: "",
		label: "",
		status: "active",
		securityLevel: 1,
		createdAt: new Date(0).toISOString(),
	};
}
