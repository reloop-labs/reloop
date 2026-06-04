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
	},
	apiKey: string,
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

	// Construct forwarded body with original context
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

	const forwardedText = body.text
		? `${body.text}\n\n${forwardHeader}\n${original.textBody || ""}`
		: `${forwardHeader}\n${original.textBody || ""}`;

	const forwardedHtml = body.html
		? `${body.html}<br><br><hr>${forwardHeader.replace(/\n/g, "<br>")}<br>${original.htmlBody || original.textBody || ""}`
		: original.htmlBody
			? `<hr>${forwardHeader.replace(/\n/g, "<br>")}<br>${original.htmlBody}`
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
		},
		apiKey,
	);
}
