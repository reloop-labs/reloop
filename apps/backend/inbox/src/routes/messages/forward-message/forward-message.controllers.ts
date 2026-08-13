import { db } from "@reloop/db/client";
import { emailLog, inboundEmail, mailbox } from "@reloop/db/schema";
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

	// Fetch original message (inbound or outbound log)
	const originalInbound = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, messageId),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	let mailboxId = originalInbound?.mailboxId;
	let fromName = originalInbound?.fromName;
	let fromEmail = originalInbound?.fromEmail;
	let originalDate = originalInbound?.date || originalInbound?.createdAt;
	let originalSubject = originalInbound?.subject || "(No Subject)";
	let toEmailsStr = originalInbound?.toEmails?.join(", ") || "";
	let ccEmailsStr = originalInbound?.ccEmails
		? (originalInbound.ccEmails as string[]).join(", ")
		: null;
	let textBody = originalInbound?.textBody || "";
	let htmlBody = originalInbound?.htmlBody || undefined;

	if (!originalInbound) {
		const outboundLog = await db.query.emailLog.findFirst({
			where: and(
				eq(emailLog.id, messageId),
				eq(emailLog.organizationId, organizationId),
			),
		});

		if (!outboundLog) {
			throw createError({
				status: 404,
				message: "Message not found",
				why: `Message ${messageId} was not found in your organization`,
				fix: "Verify the message ID",
			});
		}

		const mbx = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.organizationId, organizationId),
				eq(mailbox.email, outboundLog.fromEmail),
			),
		});
		const firstMbx = mbx || (await db.query.mailbox.findFirst({
			where: eq(mailbox.organizationId, organizationId),
		}));

		mailboxId = firstMbx?.id ?? "";
		fromName = outboundLog.fromName;
		fromEmail = outboundLog.fromEmail;
		originalDate = outboundLog.sentAt || outboundLog.createdAt;
		originalSubject = outboundLog.subject || "(No Subject)";
		toEmailsStr = Array.isArray(outboundLog.toEmails)
			? (outboundLog.toEmails as string[]).join(", ")
			: "";
		ccEmailsStr = Array.isArray(outboundLog.ccEmails)
			? (outboundLog.ccEmails as string[]).join(", ")
			: null;
		textBody = outboundLog.textBody || "";
		htmlBody = outboundLog.htmlBody || undefined;
	}

	// Build forward
	const fwdSubject = originalSubject.startsWith("Fwd:")
		? originalSubject
		: `Fwd: ${originalSubject}`;

	const forwardHeader = [
		"---------- Forwarded message ----------",
		`From: ${fromName ? `${fromName} <${fromEmail}>` : fromEmail}`,
		`Date: ${originalDate?.toISOString() || "Unknown"}`,
		`Subject: ${originalSubject}`,
		`To: ${toEmailsStr}`,
		ccEmailsStr ? `Cc: ${ccEmailsStr}` : null,
		"",
	]
		.filter(Boolean)
		.join("\n");

	const forwardHeaderHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #4b5563; line-height: 1.5; padding: 16px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 16px; background-color: transparent;">
	<div style="font-weight: 600; color: #111827; margin-bottom: 8px;">---------- Forwarded message ----------</div>
	<div><strong>From:</strong> ${fromName ? `${fromName} &lt;${fromEmail || ""}&gt;` : fromEmail || ""}</div>
	<div><strong>Date:</strong> ${originalDate?.toISOString() || "Unknown"}</div>
	<div><strong>Subject:</strong> ${originalSubject}</div>
	<div><strong>To:</strong> ${toEmailsStr}</div>
	${ccEmailsStr ? `<div><strong>Cc:</strong> ${ccEmailsStr}</div>` : ""}
</div>
`.trim();

	const forwardedText = body.text
		? `${body.text}\n\n${forwardHeader}\n${textBody}`
		: `${forwardHeader}\n${textBody}`;

	const forwardedHtml = body.html
		? `${body.html}<br><br>${forwardHeaderHtml}<br>${htmlBody || textBody}`
		: htmlBody
			? `${forwardHeaderHtml}<br>${htmlBody}`
			: undefined;

	log.info(
		`[INBOX] Forwarding message ${messageId} → ${JSON.stringify(body.to)}`,
	);

	return proxySendToMailService(
		{
			mailboxId: mailboxId ?? "",
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
