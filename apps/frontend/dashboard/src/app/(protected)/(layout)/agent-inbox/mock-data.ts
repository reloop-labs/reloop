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
}

export interface AgentMailbox {
	id: string;
	email: string;
	label: string;
	description: string;
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
	from: { name?: string; email: string };
	subject: string;
	preview: string;
	bodyText: string;
	bodyHtml?: string;
	receivedAt: string;
	status: InboundThreadStatus;
	securityLevel: 1 | 2 | 3 | 4 | 5;
	unread: boolean;
	entityTag?: "invoice" | "support" | "order" | "security";
	attachments?: InboundAttachment[];
	parsed?: Record<string, unknown>;
	timeline: InboundTimelineStep[];
}

export const agentMailboxes: AgentMailbox[] = [
	{
		id: "mb-1",
		email: "support-agent@acme.dev",
		label: "Support Agent",
		description: "Customer support and API escalations",
		status: "active",
		securityLevel: 5,
		createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "mb-2",
		email: "billing-bot@acme.dev",
		label: "Billing Bot",
		description: "Invoices, receipts, and payment notifications",
		status: "active",
		securityLevel: 5,
		createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "mb-3",
		email: "onboarding@acme.dev",
		label: "Onboarding",
		description: "Welcome flows and new customer intake",
		status: "active",
		securityLevel: 1,
		createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
	},
];

const hoursAgo = (h: number) =>
	new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

const minutesAgo = (m: number) =>
	new Date(Date.now() - m * 60 * 1000).toISOString();

export const inboundThreads: InboundThread[] = [
	{
		id: "in-001",
		mailboxId: "mb-1",
		from: { name: "Jordan Lee", email: "jordan@acmecorp.com" },
		subject: "Re: API rate limits on production",
		preview:
			"We are still hitting 429s after the change yesterday. Can you confirm the new limit is active?",
		bodyText:
			"Hi team,\n\nWe are still hitting 429s after the change yesterday. Can you confirm the new limit is active on our production key?\n\nThanks,\nJordan",
		receivedAt: minutesAgo(12),
		status: "needs_approval",
		securityLevel: 5,
		unread: true,
		entityTag: "support",
		attachments: [{ name: "error-log.txt", size: "24 KB" }],
		parsed: {
			intent: "support_escalation",
			urgency: "high",
			topic: "rate_limits",
			suggestedReply:
				"Confirm limit increase is live and share dashboard link.",
		},
		timeline: [
			{ label: "Email received", at: minutesAgo(12), state: "done" },
			{ label: "Webhook delivered", at: minutesAgo(11), state: "done" },
			{ label: "Agent parsed message", at: minutesAgo(10), state: "done" },
			{ label: "Draft created", at: minutesAgo(8), state: "done" },
			{
				label: "Awaiting human approval",
				at: minutesAgo(8),
				state: "active",
			},
			{ label: "Reply sent", state: "pending" },
		],
	},
	{
		id: "in-002",
		mailboxId: "mb-2",
		from: { name: "Accounts Payable", email: "ap@vendor.io" },
		subject: "Invoice #8842 — March services",
		preview: "Please find attached invoice for March. Payment due April 15.",
		bodyText:
			"Hello,\n\nPlease find attached invoice for March consulting services. Payment is due April 15.\n\nRegards,\nAccounts Payable",
		receivedAt: hoursAgo(2),
		status: "needs_approval",
		securityLevel: 5,
		unread: true,
		entityTag: "invoice",
		attachments: [
			{ name: "invoice-8842.pdf", size: "312 KB" },
			{ name: "line-items.csv", size: "18 KB" },
		],
		parsed: {
			invoiceNumber: "8842",
			amount: 4200,
			currency: "USD",
			dueDate: "2026-04-15",
		},
		timeline: [
			{ label: "Email received", at: hoursAgo(2), state: "done" },
			{ label: "Webhook delivered", at: hoursAgo(2), state: "done" },
			{ label: "Structured parse complete", at: hoursAgo(1.9), state: "done" },
			{ label: "Awaiting human approval", state: "active" },
		],
	},
	{
		id: "in-003",
		mailboxId: "mb-1",
		from: { email: "noreply@github.com" },
		subject: "[reloop] PR #412 merged: fix webhook retries",
		preview: "Your pull request was merged into main by @alex.",
		bodyText:
			"Pull request #412 was merged.\n\nRepository: reloop-labs/reloop\nBranch: main",
		receivedAt: hoursAgo(5),
		status: "parsing",
		securityLevel: 3,
		unread: true,
		entityTag: "security",
		parsed: { source: "github", prNumber: 412 },
		timeline: [
			{ label: "Email received", at: hoursAgo(5), state: "done" },
			{ label: "Webhook delivered", at: hoursAgo(5), state: "done" },
			{ label: "Agent parsing", state: "active" },
		],
	},
	{
		id: "in-004",
		mailboxId: "mb-3",
		from: { name: "Sam Rivera", email: "sam@startup.co" },
		subject: "Welcome — getting started with Reloop",
		preview: "Thanks for signing up! Here are the first steps for your team.",
		bodyText:
			"Hi Sam,\n\nThanks for signing up. Verify your domain, create an API key, and subscribe to email.received.\n\nCheers,\nReloop Team",
		receivedAt: hoursAgo(8),
		status: "new",
		securityLevel: 1,
		unread: true,
		entityTag: "order",
		timeline: [
			{ label: "Email received", at: hoursAgo(8), state: "done" },
			{ label: "Webhook delivered", state: "pending" },
		],
	},
	{
		id: "in-005",
		mailboxId: "mb-1",
		from: { name: "Unknown Sender", email: "scanner@185.220.101.42" },
		subject: "URGENT: Verify your account now",
		preview: "Click here immediately to avoid suspension...",
		bodyText: "Suspicious promotional content blocked by policy.",
		receivedAt: hoursAgo(10),
		status: "blocked",
		securityLevel: 1,
		unread: false,
		parsed: { blockReason: "Sender not on allowlist" },
		timeline: [
			{ label: "Email received", at: hoursAgo(10), state: "done" },
			{ label: "Blocked by strict allowlist", at: hoursAgo(10), state: "done" },
		],
	},
	{
		id: "in-006",
		mailboxId: "mb-2",
		from: { name: "Stripe", email: "receipts@stripe.com" },
		subject: "Your receipt from Acme Dev (#1847)",
		preview: "Amount paid: $49.00 — View receipt",
		bodyText: "You paid $49.00 to Acme Dev.\n\nReceipt #1847",
		receivedAt: hoursAgo(24),
		status: "handled",
		securityLevel: 2,
		unread: false,
		entityTag: "invoice",
		parsed: { amount: 49, currency: "USD", receiptId: "1847" },
		timeline: [
			{ label: "Email received", at: hoursAgo(24), state: "done" },
			{ label: "Webhook delivered", at: hoursAgo(24), state: "done" },
			{ label: "Agent archived", at: hoursAgo(23), state: "done" },
		],
	},
	{
		id: "in-007",
		mailboxId: "mb-1",
		from: { name: "Morgan Chen", email: "morgan@partner.com" },
		subject: "Partnership follow-up",
		preview: "Great chat last week — sending over the draft MSA as discussed.",
		bodyText:
			"Hi,\n\nAttached is the draft MSA we discussed on our call.\n\nBest,\nMorgan",
		receivedAt: hoursAgo(30),
		status: "handled",
		securityLevel: 4,
		unread: false,
		attachments: [{ name: "msa-draft.pdf", size: "1.2 MB" }],
		timeline: [
			{ label: "Email received", at: hoursAgo(30), state: "done" },
			{ label: "Human approved reply", at: hoursAgo(28), state: "done" },
			{ label: "Reply sent", at: hoursAgo(28), state: "done" },
		],
	},
	{
		id: "in-008",
		mailboxId: "mb-3",
		from: { name: "Calendar", email: "notifications@calendar.app" },
		subject: "Reminder: onboarding call in 1 hour",
		preview: "Your meeting with the Reloop team starts at 3:00 PM.",
		bodyText: "Reminder: onboarding call at 3:00 PM UTC.",
		receivedAt: hoursAgo(1),
		status: "parsing",
		securityLevel: 3,
		unread: true,
		timeline: [
			{ label: "Email received", at: hoursAgo(1), state: "done" },
			{ label: "Webhook delivered", at: hoursAgo(1), state: "done" },
			{ label: "Agent parsing", state: "active" },
		],
	},
	{
		id: "in-009",
		mailboxId: "mb-2",
		from: { name: "Finance Bot", email: "finance@acme.dev" },
		subject: "Weekly spend summary",
		preview: "Total API credits used this week: 12,400",
		bodyText: "Weekly summary attached.",
		receivedAt: hoursAgo(48),
		status: "handled",
		securityLevel: 2,
		unread: false,
		timeline: [
			{ label: "Email received", at: hoursAgo(48), state: "done" },
			{ label: "Auto-handled by agent", at: hoursAgo(47), state: "done" },
		],
	},
	{
		id: "in-010",
		mailboxId: "mb-1",
		from: { name: "Alex Kim", email: "alex@acmecorp.com" },
		subject: "Can we extend the trial?",
		preview: "Our team needs two more weeks before we can commit to annual.",
		bodyText:
			"Hi,\n\nOur team needs two more weeks on the trial before we commit to annual. Is that possible?\n\nAlex",
		receivedAt: minutesAgo(45),
		status: "new",
		securityLevel: 2,
		unread: true,
		entityTag: "support",
		timeline: [{ label: "Email received", at: minutesAgo(45), state: "done" }],
	},
	{
		id: "in-011",
		mailboxId: "mb-2",
		from: { email: "refunds@payments.io" },
		subject: "Refund processed for order #9921",
		preview: "A refund of $120.00 has been issued to the customer.",
		bodyText: "Refund of $120.00 issued for order #9921.",
		receivedAt: hoursAgo(6),
		status: "blocked",
		securityLevel: 1,
		unread: false,
		parsed: { blockReason: "Domain not on allowlist" },
		timeline: [
			{ label: "Email received", at: hoursAgo(6), state: "done" },
			{ label: "Blocked by domain policy", at: hoursAgo(6), state: "done" },
		],
	},
	{
		id: "in-012",
		mailboxId: "mb-3",
		from: { name: "Taylor Brooks", email: "taylor@client.io" },
		subject: "Question about webhook signatures",
		preview: "Which header should we use to verify email.received payloads?",
		bodyText:
			"Hi,\n\nWhich header should we use to verify email.received webhook payloads?\n\nTaylor",
		receivedAt: hoursAgo(3),
		status: "needs_approval",
		securityLevel: 5,
		unread: true,
		entityTag: "support",
		parsed: {
			intent: "technical_question",
			topic: "webhook_verification",
		},
		timeline: [
			{ label: "Email received", at: hoursAgo(3), state: "done" },
			{ label: "Draft created", at: hoursAgo(2.8), state: "done" },
			{ label: "Awaiting human approval", state: "active" },
		],
	},
];

export const INBOX_FILTERS: { id: InboxFilter; label: string }[] = [
	{ id: "primary", label: "Primary" },
	{ id: "spam", label: "Spam" },
];

export function threadMatchesFilter(
	thread: InboundThread,
	filter: InboxFilter,
): boolean {
	switch (filter) {
		case "primary":
			return thread.status !== "blocked";
		case "spam":
			return thread.status === "blocked";
		default:
			return true;
	}
}

export function countThreadsForFilter(
	threads: InboundThread[],
	filter: InboxFilter,
	mailboxId: string | "all",
): number {
	return threads.filter(
		(t) =>
			(mailboxId === "all" || t.mailboxId === mailboxId) &&
			threadMatchesFilter(t, filter),
	).length;
}

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

export function getAgentMailbox(id: string): AgentMailbox | undefined {
	return agentMailboxes.find((m) => m.id === id);
}

export function getMailboxStats(mailboxId: string): AgentMailboxStats {
	const threads = inboundThreads.filter((t) => t.mailboxId === mailboxId);

	return {
		total: threads.length,
		unread: threads.filter((t) => t.unread).length,
	};
}
