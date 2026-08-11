/**
 * Build the messages shown in thread detail.
 *
 * When a threadId exists, wait for the thread API before painting — the list
 * row is a single preview and flashing it first (then swapping in replies)
 * causes a visible re-render flicker.
 */

export type DisplayMessageThread = {
	id: string;
	threadId?: string | null;
	direction?: string;
	from: { email: string; name?: string | null };
	subject: string;
	receivedAt: string;
	toEmails?: string[];
	ccEmails?: string[];
	bccEmails?: string[];
	bodyText?: string;
	bodyHtml?: string;
	attachments?: unknown[];
	parsed?: unknown;
};

export type DisplayMessageInput = {
	thread: DisplayMessageThread | null | undefined;
	threadData: { messages?: any[] } | null | undefined;
	threadDataMatches: boolean;
	isLoadingThread: boolean;
	mailboxEmail?: string;
	optimisticReplies?: any[];
};

export function buildDisplayMessages({
	thread,
	threadData,
	threadDataMatches,
	isLoadingThread,
	mailboxEmail = "",
	optimisticReplies = [],
}: DisplayMessageInput): any[] {
	if (!thread) return [];

	let base: any[];

	if (
		threadDataMatches &&
		threadData?.messages &&
		threadData.messages.length > 0
	) {
		const sorted = [...threadData.messages].sort(
			(a, b) =>
				new Date(a.messageAt).getTime() - new Date(b.messageAt).getTime(),
		);
		base = sorted.map((msg) => {
			const email = msg.email
				? {
						...msg.email,
						// List preview can retain Cc/Bcc when a thin get-thread
						// payload omits them (e.g. older standalone responses).
						ccEmails:
							msg.email.ccEmails?.length > 0
								? msg.email.ccEmails
								: (thread.ccEmails ?? msg.email.ccEmails ?? []),
						bccEmails:
							msg.email.bccEmails?.length > 0
								? msg.email.bccEmails
								: (thread.bccEmails ?? msg.email.bccEmails ?? []),
						toEmails:
							msg.email.toEmails?.length > 0
								? msg.email.toEmails
								: (thread.toEmails ?? msg.email.toEmails ?? []),
					}
				: msg.email;
			const next = { ...msg, email };
			if (msg.inboundEmailId === thread.id || msg.id === thread.id) {
				return { ...next, parsed: thread.parsed || msg.parsed };
			}
			return next;
		});
	} else if (thread.threadId && isLoadingThread && !threadDataMatches) {
		// Full conversation still loading — do not paint the list preview.
		base = [];
	} else {
		base = [
			{
				id: thread.id,
				direction: thread.direction || "inbound",
				fromEmail: thread.from.email,
				fromName: thread.from.name || null,
				messageAt: thread.receivedAt,
				subject: thread.subject,
				email: {
					id: thread.id,
					fromEmail: thread.from.email,
					toEmails: thread.toEmails || [mailboxEmail],
					ccEmails: thread.ccEmails ?? [],
					bccEmails: thread.bccEmails ?? [],
					subject: thread.subject,
					textBody: thread.bodyText,
					htmlBody: thread.bodyHtml,
					attachments: thread.attachments || [],
					createdAt: thread.receivedAt,
				},
				parsed: thread.parsed,
			},
		];
	}

	const apiIds = new Set(base.map((m) => m.id));
	const pending = optimisticReplies.filter((r) => !apiIds.has(r.id));
	return [...base, ...pending];
}
