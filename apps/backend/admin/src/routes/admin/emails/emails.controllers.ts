import {
	findMimeAttachment,
	parseMimeAttachments,
	sanitizeFilename,
} from "@reloop/admin/lib/mime-attachments";
import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

type StoredAttachment = {
	id: string;
	filename: string;
	contentType: string;
	size: number;
	storagePath?: string;
	contentDisposition?: string | null;
	contentId?: string | null;
};

function withRealSizes(
	attachments: StoredAttachment[],
	rawMessage: string | null,
): StoredAttachment[] {
	if (!rawMessage || attachments.length === 0) return attachments;
	let parsed: ReturnType<typeof parseMimeAttachments> | null = null;
	try {
		parsed = parseMimeAttachments(rawMessage);
	} catch {
		return attachments;
	}
	if (parsed.length === 0) return attachments;
	return attachments.map((att, i) => {
		const match =
			parsed.find((p) => p.filename === att.filename) ??
			(att.contentId
				? parsed.find((p) => p.contentId === att.contentId)
				: undefined) ??
			parsed[i];
		if (!match) return att;
		return { ...att, size: match.bytes.byteLength };
	});
}

export async function listEmailsController({
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
		conditions.push(eq(emailLog.organizationId, organizationId));
	}
	if (status) {
		conditions.push(
			eq(
				emailLog.status,
				status as
					| "pending"
					| "sent"
					| "delivered"
					| "failed"
					| "bounced"
					| "spam"
					| "archived",
			),
		);
	}
	if (q) {
		conditions.push(
			or(
				ilike(emailLog.fromEmail, `%${q}%`),
				ilike(emailLog.subject, `%${q}%`),
				sql`cast(${emailLog.toEmails} as text) ilike ${`%${q}%`}`,
			)!,
		);
	}
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [totalRow] = await db
		.select({ value: count() })
		.from(emailLog)
		.where(whereClause);

	const items = await db
		.select({
			id: emailLog.id,
			organizationId: emailLog.organizationId,
			fromEmail: emailLog.fromEmail,
			toEmails: emailLog.toEmails,
			subject: emailLog.subject,
			status: emailLog.status,
			attachments: emailLog.attachments,
			createdAt: emailLog.createdAt,
			sentAt: emailLog.sentAt,
		})
		.from(emailLog)
		.where(whereClause)
		.orderBy(desc(emailLog.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		items: items.map((item) => ({
			...item,
			attachments: item.attachments ?? [],
		})),
		total: totalRow?.value ?? 0,
	};
}

export async function getEmailController(emailId: string) {
	const email = await db.query.emailLog.findFirst({
		where: eq(emailLog.id, emailId),
		with: {
			events: {
				orderBy: (events, { asc }) => [asc(events.createdAt)],
			},
			organization: {
				columns: {
					id: true,
					name: true,
				},
			},
			domain: {
				columns: {
					id: true,
					domain: true,
				},
			},
		},
	});

	if (!email) {
		const { createError } = await import("evlog");
		throw createError({
			status: 404,
			message: "Email not found",
			why: `No email log with id ${emailId}`,
			fix: "Check the email id and try again",
		});
	}

	return {
		...email,
		organizationName: email.organization?.name ?? null,
		domainName: email.domain?.domain ?? null,
		attachments: withRealSizes(
			(email.attachments ?? []) as StoredAttachment[],
			email.rawMessage ?? null,
		),
		events: (email.events || []).map((ev) => ({
			id: ev.id,
			type: ev.type,
			metadata: ev.metadata ?? null,
			createdAt: ev.createdAt,
		})),
	};
}

export async function downloadEmailAttachmentController(
	emailId: string,
	attachmentId: string,
): Promise<{ bytes: Uint8Array; filename: string; contentType: string }> {
	const { createError } = await import("evlog");
	const email = await db.query.emailLog.findFirst({
		where: eq(emailLog.id, emailId),
		columns: { id: true, rawMessage: true, attachments: true },
	});
	if (!email) {
		throw createError({
			status: 404,
			message: "Email not found",
			why: `No email log with id ${emailId}`,
			fix: "Check the email id and try again",
		});
	}
	const attachments = (email.attachments ?? []) as StoredAttachment[];
	const index = attachments.findIndex((a) => a.id === attachmentId);
	const meta = attachments[index];
	if (index < 0 || !meta) {
		throw createError({
			status: 404,
			message: "Attachment not found",
			why: `No attachment with id ${attachmentId} on email ${emailId}`,
			fix: "Refresh the email detail and try again",
		});
	}
	if (!email.rawMessage) {
		throw createError({
			status: 404,
			message: "Attachment content unavailable",
			why: `Raw MIME is not stored for email ${emailId}, so the file bytes cannot be reconstructed`,
			fix: "Download the file from the original upload source instead",
		});
	}
	let match: ReturnType<typeof findMimeAttachment>;
	try {
		match = findMimeAttachment(email.rawMessage, meta, index);
	} catch {
		match = null;
	}
	if (!match || match.bytes.byteLength === 0) {
		throw createError({
			status: 404,
			message: "Attachment content unavailable",
			why: `File '${meta.filename}' was not found in the stored MIME for email ${emailId}`,
			fix: "The stored message may be truncated; check the Raw tab",
		});
	}
	return {
		bytes: match.bytes,
		filename: sanitizeFilename(match.filename || meta.filename),
		contentType: match.contentType || meta.contentType,
	};
}
