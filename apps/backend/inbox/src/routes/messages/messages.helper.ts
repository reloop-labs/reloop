import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { inboxConfig } from "../../inbox.config";

export interface SendFromInboxParams {
	mailboxId: string;
	organizationId: string;
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

	// Resolve the mailbox to get the from address
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

	// Remove undefined values
	for (const key of Object.keys(sendBody)) {
		if (sendBody[key] === undefined) delete sendBody[key];
	}

	// Proxy to the mail service
	const mailServiceUrl = `${inboxConfig.BASE_URL}/api/mail/v1/send`;
	log.info(`[INBOX] Proxying send to mail service: ${mailServiceUrl}`);

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (apiKey) {
		// Caller supplied a plaintext API key (e.g. from x-api-key on the request)
		headers["x-api-key"] = apiKey;
	}

	if (cookie) {
		headers["cookie"] = cookie;
	}

	// Backend-only path (cron): no cookie and no recoverable plaintext key in DB
	if (!apiKey && !cookie) {
		headers["x-internal-secret"] = inboxConfig.RELOOP_INTERNAL_SECRET;
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
		throw createError({
			status: response.status as 500,
			message: "Failed to send email",
			why: `Mail service returned ${response.status}`,
			fix: "Check mail service logs for details",
		});
	}

	return await response.json();
}
