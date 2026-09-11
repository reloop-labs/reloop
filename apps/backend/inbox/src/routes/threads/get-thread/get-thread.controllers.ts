import { db } from "@reloop/db/client";
import {
	emailLog,
	emailThread,
	inboundEmail,
	threadMessage,
} from "@reloop/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { createError } from "evlog";
import { mapEmailLogAttachments } from "../../../lib/outbound-attachments";

function asIso(value: Date | string | null | undefined): string {
	if (!value) return new Date(0).toISOString();
	return typeof value === "string" ? value : value.toISOString();
}

function uniqueAddresses(
	...groups: Array<string[] | null | undefined>
): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const group of groups) {
		for (const raw of group ?? []) {
			const addr = String(raw ?? "").trim();
			if (!addr) continue;
			const key = addr.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(addr);
		}
	}
	return out;
}

function asStringList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map((v) => String(v ?? "").trim()).filter(Boolean);
	}
	if (typeof value === "string" && value.trim()) return [value.trim()];
	return [];
}

export async function getThreadController(id: string, organizationId: string) {
	// 1. Try finding directly by emailThread.id
	let thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
		with: {
			messages: {
				orderBy: [desc(threadMessage.messageAt)],
			},
		},
	});

	// 2. If not found by emailThread.id, check if id is an inboundEmail.id with a threadId column
	if (!thread) {
		const inb = await db.query.inboundEmail.findFirst({
			where: eq(inboundEmail.id, id),
		});
		if (inb?.threadId) {
			thread = await db.query.emailThread.findFirst({
				where: eq(emailThread.id, inb.threadId),
				with: {
					messages: {
						orderBy: [desc(threadMessage.messageAt)],
					},
				},
			});
		}
	}

	// 3. Check threadMessage table by inboundEmailId, emailLogId, or message ID
	if (!thread) {
		const tm = await db.query.threadMessage.findFirst({
			where: or(
				eq(threadMessage.inboundEmailId, id),
				eq(threadMessage.emailLogId, id),
				eq(threadMessage.id, id),
			),
		});

		if (tm?.threadId) {
			thread = await db.query.emailThread.findFirst({
				where: eq(emailThread.id, tm.threadId),
				with: {
					messages: {
						orderBy: [desc(threadMessage.messageAt)],
					},
				},
			});
		}
	}

	// 4. If a thread record was found, hydrate messages
	if (thread) {
		const rows =
			thread.messages.length > 0
				? thread.messages
				: await db.query.threadMessage.findMany({
						where: eq(threadMessage.threadId, thread.id),
						orderBy: [desc(threadMessage.messageAt)],
					});

		const hydratedMessages = await Promise.all(
			rows.map(async (msg) => {
				const createdAt = asIso(msg.createdAt);
				const messageAt = asIso(msg.messageAt);
				const base = {
					id: msg.id,
					threadId: msg.threadId,
					direction: msg.direction,
					inboundEmailId: msg.inboundEmailId ?? null,
					emailLogId: msg.emailLogId ?? null,
					fromEmail: msg.fromEmail || "",
					fromName: msg.fromName ?? null,
					subject: msg.subject ?? null,
					preview: msg.preview ?? null,
					messageAt,
					rfc822MessageId: msg.rfc822MessageId ?? null,
					inReplyTo: msg.inReplyTo ?? null,
					createdAt,
				};

				if (msg.direction === "inbound" && msg.inboundEmailId) {
					const email = await db.query.inboundEmail.findFirst({
						where: eq(inboundEmail.id, msg.inboundEmailId),
						with: { attachments: true },
					});
					return {
						...base,
						email: email
							? {
									id: email.id,
									fromEmail: email.fromEmail,
									fromName: email.fromName ?? null,
									toEmails: asStringList(email.toEmails),
									ccEmails: asStringList(email.ccEmails),
									replyTo: email.replyTo ?? null,
									subject: email.subject ?? null,
									textBody: email.textBody ?? msg.preview ?? null,
									htmlBody: email.htmlBody ?? null,
									isRead: Boolean(email.isRead),
									isStarred: Boolean(email.isStarred),
									attachments: (email.attachments ?? []).map((att) => ({
										id: att.id,
										inboundEmailId: att.inboundEmailId,
										filename: att.filename,
										contentType: att.contentType,
										size: typeof att.size === "number" ? att.size : 0,
										storagePath: att.storagePath,
										contentDisposition: att.contentDisposition ?? null,
										contentId: att.contentId ?? null,
										createdAt: asIso(att.createdAt),
									})),
									createdAt: asIso(email.createdAt),
								}
							: {
									id: msg.inboundEmailId,
									fromEmail: msg.fromEmail || "",
									fromName: msg.fromName ?? null,
									toEmails: [],
									ccEmails: [],
									replyTo: null,
									subject: msg.subject ?? null,
									textBody: msg.preview ?? null,
									htmlBody: null,
									isRead: true,
									isStarred: false,
									attachments: [],
									createdAt: messageAt,
								},
					};
				}

				if (msg.direction === "outbound" && msg.emailLogId) {
					const email = await db.query.emailLog.findFirst({
						where: eq(emailLog.id, msg.emailLogId),
					});
					return {
						...base,
						errorMessage: email?.errorMessage ?? null,
						email: email
							? {
									id: email.id,
									fromEmail: email.fromEmail,
									fromName: email.fromName ?? null,
									toEmails: asStringList(email.toEmails),
									ccEmails: asStringList(email.ccEmails),
									bccEmails: asStringList(email.bccEmails),
									subject: email.subject ?? null,
									textBody: email.textBody ?? msg.preview ?? null,
									htmlBody: email.htmlBody ?? null,
									status: email.status || "sent",
									errorMessage: email.errorMessage ?? null,
									sentAt: email.sentAt ? asIso(email.sentAt) : null,
									createdAt: asIso(email.createdAt),
									attachments: mapEmailLogAttachments(email.attachments),
								}
							: {
									id: msg.emailLogId,
									fromEmail: msg.fromEmail || "",
									fromName: msg.fromName ?? null,
									toEmails: [],
									ccEmails: [],
									bccEmails: [],
									subject: msg.subject ?? null,
									textBody: msg.preview ?? null,
									htmlBody: null,
									status: "sent",
									errorMessage: null,
									sentAt: messageAt,
									createdAt: messageAt,
									attachments: [],
								},
					};
				}

				return { ...base, email: null };
			}),
		);

		return {
			...thread,
			participants: thread.participants || [],
			messageCount: Math.max(thread.messageCount ?? 0, hydratedMessages.length),
			messages: hydratedMessages,
		};
	}

	// 5. Fallback: Check if id is a standalone inbound email
	const standaloneInbound = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, id),
			eq(inboundEmail.organizationId, organizationId),
		),
		with: { attachments: true },
	});

	if (standaloneInbound) {
		const createdAt = asIso(standaloneInbound.createdAt);
		const preview = (
			standaloneInbound.snippet ||
			standaloneInbound.textBody ||
			""
		)
			.toString()
			.slice(0, 200);
		return {
			id: standaloneInbound.id,
			mailboxId: standaloneInbound.mailboxId,
			organizationId: standaloneInbound.organizationId,
			subject: standaloneInbound.subject ?? "(no subject)",
			lastMessagePreview: preview,
			lastMessageAt: createdAt,
			status: "active",
			messageCount: 1,
			participants: uniqueAddresses(
				[standaloneInbound.fromEmail],
				standaloneInbound.toEmails,
				standaloneInbound.ccEmails,
			),
			isRead: Boolean(standaloneInbound.isRead),
			isStarred: Boolean(standaloneInbound.isStarred),
			createdAt,
			updatedAt: createdAt,
			messages: [
				{
					id: `msg_${standaloneInbound.id}`,
					threadId: standaloneInbound.id,
					direction: "inbound",
					inboundEmailId: standaloneInbound.id,
					emailLogId: null,
					fromEmail: standaloneInbound.fromEmail,
					fromName: standaloneInbound.fromName ?? null,
					subject: standaloneInbound.subject ?? null,
					preview,
					messageAt: createdAt,
					rfc822MessageId: standaloneInbound.messageId ?? null,
					inReplyTo: null,
					createdAt,
					email: {
						id: standaloneInbound.id,
						fromEmail: standaloneInbound.fromEmail,
						fromName: standaloneInbound.fromName ?? null,
						toEmails: asStringList(standaloneInbound.toEmails),
						ccEmails: asStringList(standaloneInbound.ccEmails),
						replyTo: standaloneInbound.replyTo ?? null,
						subject: standaloneInbound.subject ?? null,
						textBody: standaloneInbound.textBody ?? null,
						htmlBody: standaloneInbound.htmlBody ?? null,
						isRead: Boolean(standaloneInbound.isRead),
						isStarred: Boolean(standaloneInbound.isStarred),
						attachments: (standaloneInbound.attachments ?? []).map((att) => ({
							id: att.id,
							inboundEmailId: att.inboundEmailId,
							filename: att.filename,
							contentType: att.contentType,
							size: typeof att.size === "number" ? att.size : 0,
							storagePath: att.storagePath,
							contentDisposition: att.contentDisposition ?? null,
							contentId: att.contentId ?? null,
							createdAt: asIso(att.createdAt),
						})),
						createdAt,
					},
				},
			],
		};
	}

	// 6. Fallback: Check if id is a standalone email log (outbound / Sent)
	const standaloneLog = await db.query.emailLog.findFirst({
		where: and(
			eq(emailLog.id, id),
			eq(emailLog.organizationId, organizationId),
		),
	});

	if (standaloneLog) {
		const createdAt = asIso(standaloneLog.createdAt);
		const ccEmails = asStringList(standaloneLog.ccEmails);
		const bccEmails = asStringList(standaloneLog.bccEmails);
		const toEmails = asStringList(standaloneLog.toEmails);
		const preview = (standaloneLog.textBody || "").toString().slice(0, 200);
		return {
			id: standaloneLog.id,
			mailboxId: null,
			organizationId: standaloneLog.organizationId,
			subject: standaloneLog.subject ?? "(no subject)",
			lastMessagePreview: preview,
			lastMessageAt: createdAt,
			status: "active",
			messageCount: 1,
			participants: uniqueAddresses(
				[standaloneLog.fromEmail],
				toEmails,
				ccEmails,
			),
			isRead: true,
			isStarred: false,
			createdAt,
			updatedAt: createdAt,
			messages: [
				{
					id: `msg_${standaloneLog.id}`,
					threadId: standaloneLog.id,
					direction: "outbound",
					inboundEmailId: null,
					emailLogId: standaloneLog.id,
					fromEmail: standaloneLog.fromEmail,
					fromName: standaloneLog.fromName ?? null,
					subject: standaloneLog.subject ?? null,
					preview,
					messageAt: createdAt,
					errorMessage: standaloneLog.errorMessage ?? null,
					rfc822MessageId: standaloneLog.messageId ?? null,
					inReplyTo: null,
					createdAt,
					email: {
						id: standaloneLog.id,
						fromEmail: standaloneLog.fromEmail,
						fromName: standaloneLog.fromName ?? null,
						toEmails,
						ccEmails,
						bccEmails,
						subject: standaloneLog.subject ?? null,
						textBody: standaloneLog.textBody ?? null,
						htmlBody: standaloneLog.htmlBody ?? null,
						status: standaloneLog.status || "sent",
						errorMessage: standaloneLog.errorMessage ?? null,
						sentAt: standaloneLog.sentAt ? asIso(standaloneLog.sentAt) : null,
						createdAt,
						attachments: mapEmailLogAttachments(standaloneLog.attachments),
					},
				},
			],
		};
	}

	throw createError({
		status: 404,
		message: "Thread not found",
		why: `Thread ${id} was not found in your organization`,
		fix: "Verify the thread ID and ensure it belongs to your organization",
	});
}
