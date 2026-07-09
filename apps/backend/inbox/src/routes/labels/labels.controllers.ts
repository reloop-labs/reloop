import { db } from "@reloop/db/client";
import {
	emailLabel,
	emailThread,
	mailbox,
	threadLabel,
} from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function listLabelsController(
	organizationId: string,
	mailboxId?: string,
) {
	const conditions = [eq(emailLabel.organizationId, organizationId)];
	if (mailboxId) {
		conditions.push(eq(emailLabel.mailboxId, mailboxId));
	}

	return db.query.emailLabel.findMany({
		where: and(...conditions),
		orderBy: (l, { asc }) => [asc(l.name)],
	});
}

export async function createLabelController(
	organizationId: string,
	input: { mailboxId: string; name: string; color?: string },
) {
	const log = useLogger();

	const mb = await db.query.mailbox.findFirst({
		where: and(
			eq(mailbox.id, input.mailboxId),
			eq(mailbox.organizationId, organizationId),
		),
	});

	if (!mb) {
		throw createError({
			status: 404,
			message: "Mailbox not found",
			why: `Mailbox ${input.mailboxId} was not found`,
			fix: "Verify the mailbox ID",
		});
	}

	const [label] = await db
		.insert(emailLabel)
		.values({
			mailboxId: input.mailboxId,
			organizationId,
			name: input.name.trim(),
			color: input.color || "default",
		})
		.returning();

	if (!label) {
		throw createError({
			status: 500,
			message: "Failed to create label",
			why: "Insert returned no row",
			fix: "Retry the request",
		});
	}

	log.info(`[LABEL] Created label ${label.id}`);
	return label;
}

export async function updateLabelController(
	id: string,
	organizationId: string,
	updates: { name?: string; color?: string },
) {
	const log = useLogger();

	const existing = await db.query.emailLabel.findFirst({
		where: and(
			eq(emailLabel.id, id),
			eq(emailLabel.organizationId, organizationId),
		),
	});

	if (!existing) {
		throw createError({
			status: 404,
			message: "Label not found",
			why: `Label ${id} was not found`,
			fix: "Verify the label ID",
		});
	}

	const [updated] = await db
		.update(emailLabel)
		.set({
			...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
			...(updates.color !== undefined ? { color: updates.color } : {}),
		})
		.where(eq(emailLabel.id, id))
		.returning();

	if (!updated) {
		throw createError({
			status: 500,
			message: "Failed to update label",
			why: "Update returned no row",
			fix: "Retry the request",
		});
	}

	log.info(`[LABEL] Updated label ${id}`);
	return updated;
}

export async function deleteLabelController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	const existing = await db.query.emailLabel.findFirst({
		where: and(
			eq(emailLabel.id, id),
			eq(emailLabel.organizationId, organizationId),
		),
	});

	if (!existing) {
		throw createError({
			status: 404,
			message: "Label not found",
			why: `Label ${id} was not found`,
			fix: "Verify the label ID",
		});
	}

	await db.delete(emailLabel).where(eq(emailLabel.id, id));
	log.info(`[LABEL] Deleted label ${id}`);
	return { success: true, id };
}

export async function assignLabelController(
	organizationId: string,
	threadId: string,
	labelId: string,
) {
	const log = useLogger();

	const foundThread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, threadId),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!foundThread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${threadId} was not found`,
			fix: "Verify the thread ID",
		});
	}

	const foundLabel = await db.query.emailLabel.findFirst({
		where: and(
			eq(emailLabel.id, labelId),
			eq(emailLabel.organizationId, organizationId),
		),
	});

	if (!foundLabel) {
		throw createError({
			status: 404,
			message: "Label not found",
			why: `Label ${labelId} was not found`,
			fix: "Verify the label ID",
		});
	}

	await db
		.insert(threadLabel)
		.values({ threadId, labelId })
		.onConflictDoNothing();

	log.info(`[LABEL] Assigned ${labelId} to thread ${threadId}`);
	return { success: true, threadId, labelId };
}

export async function unassignLabelController(
	organizationId: string,
	threadId: string,
	labelId: string,
) {
	const log = useLogger();

	const foundThread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, threadId),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!foundThread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${threadId} was not found`,
			fix: "Verify the thread ID",
		});
	}

	await db
		.delete(threadLabel)
		.where(
			and(eq(threadLabel.threadId, threadId), eq(threadLabel.labelId, labelId)),
		);

	log.info(`[LABEL] Unassigned ${labelId} from thread ${threadId}`);
	return { success: true, threadId, labelId };
}

export async function listThreadLabelsController(
	organizationId: string,
	threadId: string,
) {
	const foundThread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, threadId),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!foundThread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${threadId} was not found`,
			fix: "Verify the thread ID",
		});
	}

	const links = await db.query.threadLabel.findMany({
		where: eq(threadLabel.threadId, threadId),
		with: { label: true },
	});

	return links.map((l) => l.label);
}

export async function listLabelThreadIdsController(
	organizationId: string,
	labelId: string,
) {
	const foundLabel = await db.query.emailLabel.findFirst({
		where: and(
			eq(emailLabel.id, labelId),
			eq(emailLabel.organizationId, organizationId),
		),
	});

	if (!foundLabel) {
		throw createError({
			status: 404,
			message: "Label not found",
			why: `Label ${labelId} was not found`,
			fix: "Verify the label ID",
		});
	}

	const links = await db.query.threadLabel.findMany({
		where: eq(threadLabel.labelId, labelId),
	});

	return { threadIds: links.map((l) => l.threadId) };
}
