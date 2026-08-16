export type InboundThreadStatus =
	| "new"
	| "parsing"
	| "needs_approval"
	| "handled"
	| "blocked";

export type InboxView = "all" | "unread" | "needs_approval" | "starred";

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

export interface InboxLabel {
	id: string;
	mailboxId: string;
	name: string;
	color: string;
}

export interface ThreadNote {
	id: string;
	threadId: string;
	content: string;
	color: string;
	isPinned: boolean;
	order: number;
	createdAt: string;
	updatedAt: string;
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
	isImportant?: boolean;
	isPinned?: boolean;
	pinnedAt?: string | null;
	messageCount?: number;
	isSpam?: boolean;
	isTrashed?: boolean;
	labels?: InboxLabel[];
	entityTag?: "invoice" | "support" | "order" | "security";
	direction?: "inbound" | "outbound";
	toEmails?: string[];
	ccEmails?: string[];
	bccEmails?: string[];
	attachments?: InboundAttachment[];
	parsed?: Record<string, unknown>;
	timeline: InboundTimelineStep[];
}

export type BatchThreadAction =
	| "archive"
	| "unarchive"
	| "trash"
	| "restore"
	| "star"
	| "unstar"
	| "read"
	| "unread"
	| "important"
	| "unimportant"
	| "spam"
	| "unspam"
	| "pin"
	| "unpin";

export type ComposeDraftKind = "compose" | "reply" | "reply_all" | "forward";

export type ComposeDraftAttachment = {
	id?: string;
	filename?: string;
	path?: string;
	url?: string;
	content_type?: string;
	size?: string;
};

/** Persisted compose / reply / forward draft from `/api/inbox/v1/drafts`. */
export type ComposeDraft = {
	id: string;
	mailboxId: string;
	kind: ComposeDraftKind;
	threadId: string | null;
	inReplyToMessageId: string | null;
	to: string[];
	cc: string[];
	bcc: string[];
	subject: string;
	html: string;
	text: string;
	attachments: ComposeDraftAttachment[];
	createdAt: string;
	updatedAt: string;
};

export type SaveComposeDraftInput = {
	id?: string;
	mailboxId: string;
	kind?: ComposeDraftKind;
	threadId?: string | null;
	inReplyToMessageId?: string | null;
	to?: string[];
	cc?: string[];
	bcc?: string[];
	subject?: string;
	html?: string;
	text?: string;
	attachments?: ComposeDraftAttachment[];
};

export const INBOX_VIEWS: {
	id: InboxView;
	label: string;
	icon: "inbox" | "mail-single" | "alert-triangle" | "star";
}[] = [
	{ id: "all", label: "All", icon: "inbox" },
	{ id: "unread", label: "Unread", icon: "mail-single" },
	{ id: "needs_approval", label: "To review", icon: "alert-triangle" },
	{ id: "starred", label: "Starred", icon: "star" },
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
