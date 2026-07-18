import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
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
		let why = `Mail service returned ${response.status}`;
		try {
			const parsed = JSON.parse(errorBody) as {
				message?: string;
				why?: string;
			};
			why = parsed.why || parsed.message || why;
		} catch {
			if (errorBody) why = errorBody.slice(0, 500);
		}
		throw createError({
			status: response.status as 500,
			message: why,
			why,
			fix: "Check mail service logs for details",
		});
	}

	return await response.json();
}
