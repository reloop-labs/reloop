import { db } from "@reloop/db/client";
import { emailLog, emailThread, inboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function archiveThreadController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	let thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
	});

	let targetThreadId = id;

	if (!thread) {
		const msg = await db.query.inboundEmail.findFirst({
			where: and(
				eq(inboundEmail.id, id),
				eq(inboundEmail.organizationId, organizationId),
			),
		});
		if (msg?.threadId) {
			targetThreadId = msg.threadId;
			thread = await db.query.emailThread.findFirst({
				where: and(
					eq(emailThread.id, targetThreadId),
					eq(emailThread.organizationId, organizationId),
				),
			});
		}
	}

	if (!thread) {
		const outMsg = await db.query.emailLog.findFirst({
			where: and(
				eq(emailLog.id, id),
				eq(emailLog.organizationId, organizationId),
			),
		});
		if (outMsg?.threadId) {
			targetThreadId = outMsg.threadId;
			thread = await db.query.emailThread.findFirst({
				where: and(
					eq(emailThread.id, targetThreadId),
					eq(emailThread.organizationId, organizationId),
				),
			});
		} else if (outMsg) {
			const [created] = await db
				.insert(emailThread)
				.values({
					id: outMsg.id,
					organizationId,
					mailboxId: null,
					subject: outMsg.subject || "(No Subject)",
					lastMessagePreview: outMsg.textBody
						? outMsg.textBody.substring(0, 120)
						: "",
					lastMessageAt: outMsg.createdAt,
					status: "archived",
					messageCount: 1,
					participants: [outMsg.fromEmail, ...(outMsg.toEmails ?? [])],
				})
				.onConflictDoUpdate({
					target: emailThread.id,
					set: { status: "archived" },
				})
				.returning();
			thread = created;
			targetThreadId = outMsg.id;
		}
	}

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	await db
		.update(emailThread)
		.set({ status: "archived" })
		.where(eq(emailThread.id, targetThreadId));

	log.info(`[THREAD] Archived thread ${targetThreadId}`);
	return { success: true, id: targetThreadId, status: "archived" };
}
