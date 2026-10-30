import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { inboxConfig } from "../../inbox.config";

export interface SendFromInboxParams {
	mailboxId: string;
	organizationId: string;

	userId?: string;
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	cc?: string | string[];
	bcc?: string | string[];
	threadId?: string;
	headers?: Record<string, string>;
	attachments?: Array<{
		content?: string;
		filename?: string;
		path?: string;
		content_type?: string;
		content_id?: string;
	}>;
}

function getLog() {
	try {
		return useLogger();
	} catch {
		return {
			info: (msg: string) => console.log(msg),
			error: (msg: string) => console.error(msg),
		};
	}
}

export async function proxySendToMailService(
	params: SendFromInboxParams,
	apiKey: string,
	cookie?: string,
) {
	const log = getLog();

	const mbx = await db.query.mailbox.findFirst({
		where: and(
			eq(mailbox.id, params.mailboxId),
			eq(mailbox.organizationId, params.organizationId),
		),
	});

	if (!mbx) {
		throw createError({
			status: 404,
			message: "Mailbox not found",
			why: `Mailbox ${params.mailboxId} was not found`,
			fix: "Verify the mailbox ID",
		});
	}

	if (mbx.status !== "active") {
		throw createError({
			status: 403,
			message:
				mbx.status === "suspended" ? "Inbox suspended" : "Inbox disabled",
			why:
				mbx.status === "suspended"
					? `Mailbox ${mbx.email} is over your plan's inbox limit and was suspended`
					: `Mailbox ${mbx.email} is disabled`,
			fix:
				mbx.status === "suspended"
					? "Upgrade your plan or remove another inbox to re-enable it"
					: "Enable the inbox before sending from it",
		});
	}

	const fromAddress = mbx.displayName
		? `${mbx.displayName} <${mbx.email}>`
		: mbx.email;

	const sendBody: Record<string, unknown> = {
		from: fromAddress,
		to: params.to,
		subject: params.subject,
		text: params.text,
		html: params.html,
		cc: params.cc,
		bcc: params.bcc,
		thread_id: params.threadId,
		headers: params.headers,
		attachments: params.attachments,
	};

	for (const key of Object.keys(sendBody)) {
		if (sendBody[key] === undefined) delete sendBody[key];
	}

	const mailServiceUrl = `${inboxConfig.BASE_URL}/api/mail/v1/send`;
	log.info(`[INBOX] Proxying send to mail service: ${mailServiceUrl}`);

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		// Mail service requires a non-empty User-Agent (requireUserAgentPlugin).
		"User-Agent": "ReloopInbox/1.0",
	};

	if (apiKey) {
		headers["x-api-key"] = apiKey;
	}

	if (cookie) {
		headers["cookie"] = cookie;
	}

	if (!apiKey && !cookie) {
		headers["x-internal-secret"] = inboxConfig.RELOOP_INTERNAL_SECRET;
		// Internal auth requires x-user-id; prefer the composer. "system" is auth-only
		// and must not be written to email_log.user_id (FK to user).
		headers["x-user-id"] = params.userId ?? "system";
		headers["x-organization-id"] = params.organizationId;
	}

	const response = await fetch(mailServiceUrl, {
		method: "POST",
		headers,
		body: JSON.stringify(sendBody),
	});

	if (!response.ok) {
		const errorBody = await response.text();
		log.error(`[INBOX] Mail service error: ${response.status} ${errorBody}`);
		let message = `Mail service returned ${response.status}`;
		let why = message;
		let fix = "Try again in a moment. If it keeps failing, contact support.";
		try {
			const parsed = JSON.parse(errorBody) as {
				message?: string;
				why?: string;
				fix?: string;
			};
			message = parsed.message || parsed.why || message;
			why = parsed.why || parsed.message || why;
			fix = parsed.fix || fix;
		} catch {
			if (errorBody) why = message = errorBody.slice(0, 500);
		}
		// Pass the mail service's own explanation through unchanged.
		throw createError({
			status: response.status as 500,
			message,
			why,
			fix,
		});
	}

	return await response.json();
}

const bareLower = (value: string): string =>
	(value.match(/<([^>]+)>/)?.[1] ?? value).trim().toLowerCase();

/** Bare lowercased address with any `+tag` dropped, for "is this us?" checks. */
export function addressKey(value: string): string {
	const bare = bareLower(value);
	const at = bare.lastIndexOf("@");
	if (at < 0) return bare;
	return `${bare.slice(0, at).split("+")[0]}${bare.slice(at)}`;
}

/** `Re: Hi` stays as is; `RE: Hi` is not prefixed again. */
export function replySubject(subject: string): string {
	return /^re:/i.test(subject.trim()) ? subject : `Re: ${subject}`;
}

export function forwardSubject(subject: string): string {
	return /^(fwd?|fw):/i.test(subject.trim()) ? subject : `Fwd: ${subject}`;
}

/** In-Reply-To + References so every client threads the reply (RFC 5322 §3.6.4). */
export function replyThreadingHeaders(
	messageId: string | null | undefined,
	references: unknown,
): Record<string, string> | undefined {
	if (!messageId) return undefined;
	const refs = Array.isArray(references)
		? references.filter((r): r is string => typeof r === "string" && !!r)
		: [];
	const chain = [...refs.filter((r) => r !== messageId), messageId];
	return { "In-Reply-To": messageId, References: chain.join(" ") };
}

/**
 * Mailbox that sent an outbound log. Matches the bare address, case-insensitive.
 * Never falls back to another mailbox: that would send from an address the
 * user did not pick (and possibly one their API key may not use).
 */
export async function mailboxForSender(
	organizationId: string,
	fromEmail: string,
): Promise<string> {
	const address = bareLower(fromEmail);
	const mbx = await db.query.mailbox.findFirst({
		where: and(
			eq(mailbox.organizationId, organizationId),
			sql`lower(${mailbox.email}) = ${address}`,
		),
		columns: { id: true },
	});
	if (!mbx) {
		throw createError({
			status: 400,
			message: "No inbox for this sender",
			why: `${address} is not an inbox in your organization, so there is no address to reply from`,
			fix: "Reply from the inbox that sent the message, or create an inbox for this address",
		});
	}
	return mbx.id;
}
