import { db } from "@reloop/db/client";
import { inboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { proxySendToMailService } from "../messages.helper";

export async function forwardMessageController(
	messageId: string,
	organizationId: string,
	body: {
		to: string | string[];
		text?: string;
		html?: string;
		cc?: string | string[];
		bcc?: string | string[];
		attachments?: Array<{
			content?: string;
			filename?: string;
			path?: string;
			content_type?: string;
			content_id?: string;
		}>;
	},
	apiKey: string,
	cookie?: string,
) {
	const log = useLogger();

	// Fetch original message
	const original = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, messageId),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	if (!original) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${messageId} was not found in your organization`,
			fix: "Verify the message ID",
		});
	}

	// Build forward
	const fwdSubject = original.subject?.startsWith("Fwd:")
		? original.subject
		: `Fwd: ${original.subject || ""}`;

	const forwardHeader = [
		"---------- Forwarded message ----------",
		`From: ${original.fromName ? `${original.fromName} <${original.fromEmail}>` : original.fromEmail}`,
		`Date: ${original.date?.toISOString() || original.createdAt?.toISOString() || "Unknown"}`,
		`Subject: ${original.subject || "(No Subject)"}`,
		`To: ${original.toEmails?.join(", ") || ""}`,
		original.ccEmails
			? `Cc: ${(original.ccEmails as string[]).join(", ")}`
			: null,
		"",
	]
		.filter(Boolean)
		.join("\n");

	const forwardHeaderHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #4b5563; line-height: 1.5; padding: 16px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 16px; background-color: transparent;">
	<div style="font-weight: 600; color: #111827; margin-bottom: 8px;">---------- Forwarded message ----------</div>
	<div><strong>From:</strong> ${original.fromName ? `${original.fromName} &lt;${original.fromEmail || ""}&gt;` : original.fromEmail || ""}</div>
	<div><strong>Date:</strong> ${original.date?.toISOString() || original.createdAt?.toISOString() || "Unknown"}</div>
	<div><strong>Subject:</strong> ${original.subject || "(No Subject)"}</div>
	<div><strong>To:</strong> ${original.toEmails?.join(", ") || ""}</div>
	${original.ccEmails ? `<div><strong>Cc:</strong> ${(original.ccEmails as string[]).join(", ")}</div>` : ""}
</div>
`.trim();

	const forwardedText = body.text
		? `${body.text}\n\n${forwardHeader}\n${original.textBody || ""}`
		: `${forwardHeader}\n${original.textBody || ""}`;

	const forwardedHtml = body.html
		? `${body.html}<br><br>${forwardHeaderHtml}<br>${original.htmlBody || original.textBody || ""}`
		: original.htmlBody
			? `${forwardHeaderHtml}<br>${original.htmlBody}`
			: undefined;

	log.info(
		`[INBOX] Forwarding message ${messageId} → ${JSON.stringify(body.to)}`,
	);

	return proxySendToMailService(
		{
			mailboxId: original.mailboxId,
			organizationId,
			to: body.to,
			subject: fwdSubject,
			text: forwardedText,
			html: forwardedHtml,
			cc: body.cc,
			bcc: body.bcc,
			attachments: body.attachments,
		},
		apiKey,
		cookie,
	);
}
