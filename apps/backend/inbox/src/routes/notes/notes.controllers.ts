import { db } from "@reloop/db/client";
import { emailThread, threadNote } from "@reloop/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

async function assertThread(threadId: string, organizationId: string) {
	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, threadId),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${threadId} was not found`,
			fix: "Verify the thread ID",
		});
	}

	return thread;
}

export async function listNotesController(
	organizationId: string,
	threadId: string,
) {
	await assertThread(threadId, organizationId);

	return db.query.threadNote.findMany({
		where: and(
			eq(threadNote.threadId, threadId),
			eq(threadNote.organizationId, organizationId),
		),
		orderBy: [asc(threadNote.order), asc(threadNote.createdAt)],
	});
}

export async function createNoteController(
	organizationId: string,
	input: {
		threadId: string;
		content: string;
		color?: string;
		isPinned?: boolean;
	},
) {
	const log = useLogger();
	await assertThread(input.threadId, organizationId);

	const existing = await db.query.threadNote.findMany({
		where: eq(threadNote.threadId, input.threadId),
		columns: { order: true },
	});
	const maxOrder = existing.reduce((max, n) => Math.max(max, n.order), -1);

	const [note] = await db
		.insert(threadNote)
		.values({
			threadId: input.threadId,
			organizationId,
			content: input.content.trim(),
			color: input.color || "default",
			isPinned: input.isPinned ?? false,
			order: maxOrder + 1,
		})
		.returning();

	if (!note) {
		throw createError({
			status: 500,
			message: "Failed to create note",
			why: "Insert returned no row",
			fix: "Retry the request",
		});
	}

	log.info(`[NOTE] Created note ${note.id} on thread ${input.threadId}`);
	return note;
}

export async function updateNoteController(
	id: string,
	organizationId: string,
	updates: {
		content?: string;
		color?: string;
		isPinned?: boolean;
		order?: number;
	},
) {
	const log = useLogger();

	const existing = await db.query.threadNote.findFirst({
		where: and(
			eq(threadNote.id, id),
			eq(threadNote.organizationId, organizationId),
		),
	});

	if (!existing) {
		throw createError({
			status: 404,
			message: "Note not found",
			why: `Note ${id} was not found`,
			fix: "Verify the note ID",
		});
	}

	const [updated] = await db
		.update(threadNote)
		.set({
			...(updates.content !== undefined
				? { content: updates.content.trim() }
				: {}),
			...(updates.color !== undefined ? { color: updates.color } : {}),
			...(updates.isPinned !== undefined ? { isPinned: updates.isPinned } : {}),
			...(updates.order !== undefined ? { order: updates.order } : {}),
		})
		.where(eq(threadNote.id, id))
		.returning();

	if (!updated) {
		throw createError({
			status: 500,
			message: "Failed to update note",
			why: "Update returned no row",
			fix: "Retry the request",
		});
	}

	log.info(`[NOTE] Updated note ${id}`);
	return updated;
}

export async function deleteNoteController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	const existing = await db.query.threadNote.findFirst({
		where: and(
			eq(threadNote.id, id),
			eq(threadNote.organizationId, organizationId),
		),
	});

	if (!existing) {
		throw createError({
			status: 404,
			message: "Note not found",
			why: `Note ${id} was not found`,
			fix: "Verify the note ID",
		});
	}

	await db.delete(threadNote).where(eq(threadNote.id, id));
	log.info(`[NOTE] Deleted note ${id}`);
	return { success: true, id };
}

export async function reorderNotesController(
	organizationId: string,
	threadId: string,
	orderedIds: string[],
) {
	const log = useLogger();
	await assertThread(threadId, organizationId);

	const notes = await db.query.threadNote.findMany({
		where: and(
			eq(threadNote.threadId, threadId),
			eq(threadNote.organizationId, organizationId),
			inArray(threadNote.id, orderedIds),
		),
	});

	await Promise.all(
		orderedIds.map((noteId, index) => {
			if (!notes.some((n) => n.id === noteId)) return Promise.resolve();
			return db
				.update(threadNote)
				.set({ order: index })
				.where(eq(threadNote.id, noteId));
		}),
	);

	log.info(`[NOTE] Reordered notes on thread ${threadId}`);
	return listNotesController(organizationId, threadId);
}
