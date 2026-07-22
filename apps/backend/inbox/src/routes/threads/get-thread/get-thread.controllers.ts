import { db } from "@reloop/db/client";
import {
	emailLog,
	emailThread,
	inboundEmail,
	threadMessage,
} from "@reloop/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { createError } from "evlog";

export async function getThreadController(id: string, organizationId: string) {
	const thread = await db.query.emailThread.findFirst({
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

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	// Hydrate each message with its full inbound/outbound data
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
