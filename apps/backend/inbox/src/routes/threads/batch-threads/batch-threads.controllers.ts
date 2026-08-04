import { db } from "@reloop/db/client";
import { emailThread, inboundEmail, threadMessage } from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export type BatchThreadAction =
	| "archive"
	| "trash"
	| "restore"
	| "star"
	| "unstar"
	| "read"
	| "unread"
	| "important"
	| "unimportant"
	| "spam"
	| "unspam"
	| "pin"
	| "unpin";

async function setSpamForThreads(
	threadIds: string[],
	organizationId: string,
	isSpam: boolean,
) {
	const links = await db.query.threadMessage.findMany({
		where: inArray(threadMessage.threadId, threadIds),
		columns: { inboundEmailId: true },
	});

	const inboundIds = links
		.map((l) => l.inboundEmailId)
		.filter((id): id is string => Boolean(id));

	if (inboundIds.length === 0) return;

	await db
		.update(inboundEmail)
		.set({
			isSpam,
			status: isSpam ? "spam" : "received",
		})
		.where(
			and(
				inArray(inboundEmail.id, inboundIds),
				eq(inboundEmail.organizationId, organizationId),
			),
		);
}

export async function batchThreadsController(
	organizationId: string,
	ids: string[],
	action: BatchThreadAction,
) {
	const log = useLogger();

	if (ids.length === 0) {
		throw createError({
			status: 400,
			message: "No thread IDs provided",
			why: "Batch actions require at least one thread ID",
			fix: "Pass a non-empty ids array",
		});
	}

	const threads = await db.query.emailThread.findMany({
		where: and(
			eq(emailThread.organizationId, organizationId),
			inArray(emailThread.id, ids),
		),
		columns: { id: true },
	});

	const foundIds = threads.map((t) => t.id);
	if (foundIds.length === 0) {
		throw createError({
			status: 404,
			message: "No threads found",
			why: "None of the provided thread IDs belong to your organization",
			fix: "Verify the thread IDs",
		});
	}

	switch (action) {
		case "archive":
			await db
				.update(emailThread)
				.set({ status: "archived" })
				.where(inArray(emailThread.id, foundIds));
			break;
		case "trash":
			await db
				.update(emailThread)
				.set({
					status: "trash",
					deletedAt: new Date(),
				})
				.where(inArray(emailThread.id, foundIds));
			break;
		case "restore":
			await db
				.update(emailThread)
				.set({ status: "active", deletedAt: null })
				.where(inArray(emailThread.id, foundIds));
			break;
		case "star":
			await db
				.update(emailThread)
				.set({ isStarred: true })
				.where(inArray(emailThread.id, foundIds));
			break;
		case "unstar":
			await db
				.update(emailThread)
				.set({ isStarred: false })
				.where(inArray(emailThread.id, foundIds));
			break;
		case "read":
			await db
				.update(emailThread)
				.set({ isRead: true })
				.where(inArray(emailThread.id, foundIds));
			await db
				.update(inboundEmail)
				.set({ isRead: true })
				.where(
					and(
						inArray(inboundEmail.threadId, foundIds),
						eq(inboundEmail.organizationId, organizationId),
					),
				);
			break;
		case "unread":
			await db
				.update(emailThread)
				.set({ isRead: false })
				.where(inArray(emailThread.id, foundIds));
			await db
				.update(inboundEmail)
				.set({ isRead: false })
				.where(
					and(
						inArray(inboundEmail.threadId, foundIds),
						eq(inboundEmail.organizationId, organizationId),
					),
				);
			break;
		case "important":
			await db
				.update(emailThread)
				.set({ isImportant: true })
				.where(inArray(emailThread.id, foundIds));
			break;
		case "unimportant":
			await db
				.update(emailThread)
				.set({ isImportant: false })
				.where(inArray(emailThread.id, foundIds));
			break;
		case "spam":
			await setSpamForThreads(foundIds, organizationId, true);
			break;
		case "unspam":
			await setSpamForThreads(foundIds, organizationId, false);
			break;
		case "pin":
			await db
				.update(emailThread)
				.set({ isPinned: true, pinnedAt: new Date() })
				.where(inArray(emailThread.id, foundIds));
			break;
		case "unpin":
			await db
				.update(emailThread)
				.set({ isPinned: false, pinnedAt: null })
				.where(inArray(emailThread.id, foundIds));
			break;
		default:
			throw createError({
				status: 400,
				message: "Unknown batch action",
				why: `Action "${action}" is not supported`,
				fix: "Use a supported batch action",
			});
	}

	log.info(
		`[THREAD] Batch ${action} on ${foundIds.length} threads (Org: ${organizationId})`,
	);
	return { success: true, ids: foundIds, action };
}
