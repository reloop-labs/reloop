export type InboundThreadStatus =
	| "new"
	| "parsing"
	| "needs_approval"
	| "handled"
	| "blocked";

export type InboxFilter = "primary" | "spam";

export type TimelineStepState = "done" | "active" | "pending";

export interface InboundTimelineStep {
	label: string;
	at?: string;
	state: TimelineStepState;
}

export interface InboundAttachment {
	name: string;
	size: string;
	contentType?: string;
	isInline?: boolean;
}

export interface AgentMailbox {
	id: string;
	email: string;
	label: string;
	status: "active" | "disabled";
	securityLevel: 1 | 2 | 3 | 4 | 5;
	createdAt: string;
}

export interface AgentMailboxStats {
	total: number;
	unread: number;
}

export interface InboundThread {
	id: string;
	mailboxId: string;
	threadId?: string;
	/** Original message id when list row uses threadId as id */
	messageId?: string;
	from: { name?: string; email: string };
	subject: string;
	preview: string;
	bodyText: string;
	bodyHtml?: string;
	receivedAt: string;
	status: InboundThreadStatus;
	securityLevel: 1 | 2 | 3 | 4 | 5;
	unread: boolean;
	isStarred?: boolean;
	isArchived?: boolean;
	entityTag?: "invoice" | "support" | "order" | "security";
	direction?: "inbound" | "outbound";
	toEmails?: string[];
	attachments?: InboundAttachment[];
	parsed?: Record<string, unknown>;
	timeline: InboundTimelineStep[];
}

export const INBOX_FILTERS: { id: InboxFilter; label: string }[] = [
	{ id: "primary", label: "Primary" },
	{ id: "spam", label: "Spam" },
];

export const SECURITY_LEVEL_LABELS: Record<
	InboundThread["securityLevel"],
	string
> = {
	1: "Strict allowlist",
	2: "Domain allowlist",
	3: "Content filtering",
	4: "Sandboxed",
	5: "Human-in-the-loop",
};
