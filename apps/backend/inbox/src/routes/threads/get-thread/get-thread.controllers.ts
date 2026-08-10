import { db } from "@reloop/db/client";
import {
	emailLog,
	emailThread,
	inboundEmail,
	threadMessage,
} from "@reloop/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { createError } from "evlog";

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
		const hydratedMessages = await Promise.all(
			thread.messages.map(async (msg) => {
				if (msg.direction === "inbound" && msg.inboundEmailId) {
					const email = await db.query.inboundEmail.findFirst({
						where: eq(inboundEmail.id, msg.inboundEmailId),
						with: { attachments: true },
					});
					return {
						...msg,
						email: email
							? {
									id: email.id,
									fromEmail: email.fromEmail,
									fromName: email.fromName,
									toEmails: email.toEmails,
									ccEmails: email.ccEmails,
									replyTo: email.replyTo,
									subject: email.subject,
									textBody: email.textBody,
									htmlBody: email.htmlBody,
									isRead: email.isRead,
									isStarred: email.isStarred,
									attachments: email.attachments,
									createdAt: email.createdAt,
								}
							: null,
					};
				}

				if (msg.direction === "outbound" && msg.emailLogId) {
					const email = await db.query.emailLog.findFirst({
						where: eq(emailLog.id, msg.emailLogId),
					});
					return {
						...msg,
						email: email
							? {
									id: email.id,
									fromEmail: email.fromEmail,
									fromName: email.fromName,
									toEmails: email.toEmails,
									ccEmails: email.ccEmails,
									bccEmails: email.bccEmails,
									subject: email.subject,
									textBody: email.textBody,
									htmlBody: email.htmlBody,
									status: email.status,
									sentAt: email.sentAt,
									createdAt: email.createdAt,
								}
							: null,
					};
				}

				return { ...msg, email: null };
			}),
		);

		return {
			...thread,
			participants: thread.participants || [],
			messages: hydratedMessages,
		};
	}

	// 5. Fallback: Check if id is a standalone inbound email (e.g. eml_...)
	const standaloneInbound = await db.query.inboundEmail.findFirst({
		where: eq(inboundEmail.id, id),
		with: { attachments: true },
	});

	if (standaloneInbound) {
		return {
			id: standaloneInbound.id,
			organizationId: standaloneInbound.organizationId,
			mailboxId: standaloneInbound.mailboxId,
			subject: standaloneInbound.subject ?? "(no subject)",
			participants: [
				standaloneInbound.fromEmail,
				...(standaloneInbound.toEmails || []),
			].filter(Boolean),
			messages: [
				{
					id: `msg_${standaloneInbound.id}`,
					threadId: standaloneInbound.id,
					direction: "inbound",
					messageAt: standaloneInbound.createdAt,
					inboundEmailId: standaloneInbound.id,
					email: {
						id: standaloneInbound.id,
						fromEmail: standaloneInbound.fromEmail,
						fromName: standaloneInbound.fromName,
						toEmails: standaloneInbound.toEmails,
						ccEmails: standaloneInbound.ccEmails,
						replyTo: standaloneInbound.replyTo,
						subject: standaloneInbound.subject,
						textBody: standaloneInbound.textBody,
						htmlBody: standaloneInbound.htmlBody,
						isRead: standaloneInbound.isRead,
						isStarred: standaloneInbound.isStarred,
						attachments: standaloneInbound.attachments,
						createdAt: standaloneInbound.createdAt,
					},
				},
			],
		};
	}

	// 6. Fallback: Check if id is a standalone email log (outbound)
	const standaloneLog = await db.query.emailLog.findFirst({
		where: eq(emailLog.id, id),
	});

	if (standaloneLog) {
		return {
			id: standaloneLog.id,
			organizationId: standaloneLog.organizationId,
			mailboxId: null,
			subject: standaloneLog.subject ?? "(no subject)",
			participants: [
				standaloneLog.fromEmail,
				...(standaloneLog.toEmails || []),
			].filter(Boolean),
			messages: [
				{
					id: `msg_${standaloneLog.id}`,
					threadId: standaloneLog.id,
					direction: "outbound",
					messageAt: standaloneLog.createdAt,
					emailLogId: standaloneLog.id,
					email: {
						id: standaloneLog.id,
						fromEmail: standaloneLog.fromEmail,
						fromName: standaloneLog.fromName,
						toEmails: standaloneLog.toEmails,
						ccEmails: standaloneLog.ccEmails,
						bccEmails: standaloneLog.bccEmails,
						subject: standaloneLog.subject,
						textBody: standaloneLog.textBody,
						htmlBody: standaloneLog.htmlBody,
						status: standaloneLog.status,
						sentAt: standaloneLog.sentAt,
						createdAt: standaloneLog.createdAt,
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
