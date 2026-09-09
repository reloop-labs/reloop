import { db } from "@reloop/db/client";
import { inboundEmail, mailbox, organization } from "@reloop/db/schema";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { createError } from "evlog";

const INBOUND_STATUSES = [
	"received",
	"processing",
	"delivered",
	"spam",
	"rejected",
	"failed",
] as const;

type InboundStatus = (typeof INBOUND_STATUSES)[number];

function isInboundStatus(value: string): value is InboundStatus {
	return (INBOUND_STATUSES as readonly string[]).includes(value);
}

export async function listInboundEmailsController({
	limit = 50,
	offset = 0,
	q,
	status,
	organizationId,
}: {
	limit?: number;
	offset?: number;
	q?: string;
	status?: string;
	organizationId?: string;
}) {
	const conditions = [];
	if (organizationId) {
		conditions.push(eq(inboundEmail.organizationId, organizationId));
	}
	if (status && isInboundStatus(status)) {
		conditions.push(eq(inboundEmail.status, status));
	}
	if (q) {
		const term = `%${q}%`;
		const search = or(
			ilike(inboundEmail.fromEmail, term),
			ilike(inboundEmail.subject, term),
			sql`cast(${inboundEmail.toEmails} as text) ilike ${term}`,
			ilike(mailbox.email, term),
		);
		if (search) conditions.push(search);
	}
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [totalRow] = await db
		.select({ value: count() })
		.from(inboundEmail)
		.leftJoin(mailbox, eq(mailbox.id, inboundEmail.mailboxId))
		.where(whereClause);

	const items = await db
		.select({
			id: inboundEmail.id,
			organizationId: inboundEmail.organizationId,
			organizationName: organization.name,
			mailboxId: inboundEmail.mailboxId,
			mailboxEmail: mailbox.email,
			fromEmail: inboundEmail.fromEmail,
			fromName: inboundEmail.fromName,
			toEmails: inboundEmail.toEmails,
			subject: inboundEmail.subject,
			status: inboundEmail.status,
			isSpam: inboundEmail.isSpam,
			spamScore: inboundEmail.spamScore,
			size: inboundEmail.size,
			createdAt: inboundEmail.createdAt,
		})
		.from(inboundEmail)
		.leftJoin(mailbox, eq(mailbox.id, inboundEmail.mailboxId))
		.leftJoin(organization, eq(organization.id, inboundEmail.organizationId))
		.where(whereClause)
		.orderBy(desc(inboundEmail.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		items,
		total: totalRow?.value ?? 0,
	};
}

export async function getInboundEmailController(emailId: string) {
	const email = await db.query.inboundEmail.findFirst({
		where: eq(inboundEmail.id, emailId),
		with: {
			organization: {
				columns: { id: true, name: true },
			},
			mailbox: {
				columns: { id: true, email: true, displayName: true },
			},
			attachments: {
				columns: {
					id: true,
					filename: true,
					contentType: true,
					size: true,
					contentDisposition: true,
					contentId: true,
				},
			},
		},
	});

	if (!email) {
		throw createError({
			status: 404,
			message: "Inbound email not found",
			why: `No inbound email with id ${emailId}`,
			fix: "Check the inbound email id and try again",
		});
	}

	return {
		id: email.id,
		mailboxId: email.mailboxId,
		mailboxEmail: email.mailbox?.email ?? null,
		mailboxDisplayName: email.mailbox?.displayName ?? null,
		organizationId: email.organizationId,
		organizationName: email.organization?.name ?? null,
		fromEmail: email.fromEmail,
		fromName: email.fromName ?? null,
		toEmails: email.toEmails,
		ccEmails: email.ccEmails ?? null,
		bccEmails: email.bccEmails ?? null,
		replyTo: email.replyTo ?? null,
		subject: email.subject ?? "",
		textBody: email.textBody ?? null,
		htmlBody: email.htmlBody ?? null,
		snippet: email.snippet ?? null,
		rawMessage: email.rawMessage ?? null,
		size: email.size,
		status: email.status,
		isRead: email.isRead,
		isStarred: email.isStarred,
		isSpam: email.isSpam,
		spamScore: email.spamScore ?? null,
		messageId: email.messageId ?? null,
		threadId: email.threadId ?? null,
		inReplyTo: email.inReplyTo ?? null,
		headers: email.headers ?? null,
		date: email.date ?? null,
		createdAt: email.createdAt,
		attachments: email.attachments ?? [],
	};
}
