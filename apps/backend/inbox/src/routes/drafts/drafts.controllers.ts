import { db } from "@reloop/db/client";
import { composeDraft, mailbox } from "@reloop/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

type DraftAttachment = {
	id?: string;
	filename?: string;
	path?: string;
	url?: string;
	content_type?: string;
	size?: string;
};

type DraftKind = "compose" | "reply" | "reply_all" | "forward";

type DraftFields = {
	mailboxId: string;
	kind?: DraftKind;
	threadId?: string | null;
	inReplyToMessageId?: string | null;
	to?: string[];
	cc?: string[];
	bcc?: string[];
	subject?: string;
	html?: string;
	text?: string;
	attachments?: DraftAttachment[];
};

async function assertMailbox(mailboxId: string, organizationId: string) {
	const mb = await db.query.mailbox.findFirst({
		where: and(
			eq(mailbox.id, mailboxId),
			eq(mailbox.organizationId, organizationId),
		),
	});

	if (!mb) {
		throw createError({
			status: 404,
			message: "Mailbox not found",
			why: `Mailbox ${mailboxId} was not found`,
			fix: "Verify the mailbox ID",
		});
	}

	return mb;
}

export async function listDraftsController(
	organizationId: string,
	filters?: {
		mailboxId?: string;
		threadId?: string;
		kind?: DraftKind;
	},
) {
	const conditions = [eq(composeDraft.organizationId, organizationId)];
	if (filters?.mailboxId) {
		conditions.push(eq(composeDraft.mailboxId, filters.mailboxId));
	}
	if (filters?.threadId) {
		conditions.push(eq(composeDraft.threadId, filters.threadId));
	}
	if (filters?.kind) {
		conditions.push(eq(composeDraft.kind, filters.kind));
	}

	return db.query.composeDraft.findMany({
		where: and(...conditions),
		orderBy: [desc(composeDraft.updatedAt)],
	});
}

export async function getDraftController(id: string, organizationId: string) {
	const draft = await db.query.composeDraft.findFirst({
		where: and(
			eq(composeDraft.id, id),
			eq(composeDraft.organizationId, organizationId),
		),
	});

	if (!draft) {
		throw createError({
			status: 404,
			message: "Draft not found",
			why: `Draft ${id} was not found`,
			fix: "Verify the draft ID",
		});
	}

	return draft;
}

export async function createDraftController(
	organizationId: string,
	input: DraftFields,
) {
	const log = useLogger();
	await assertMailbox(input.mailboxId, organizationId);

	const [draft] = await db
		.insert(composeDraft)
		.values({
			organizationId,
			mailboxId: input.mailboxId,
			kind: input.kind ?? "compose",
			threadId: input.threadId ?? null,
			inReplyToMessageId: input.inReplyToMessageId ?? null,
			to: input.to ?? [],
			cc: input.cc ?? [],
			bcc: input.bcc ?? [],
			subject: input.subject ?? "",
			html: input.html ?? "",
			text: input.text ?? "",
			attachments: input.attachments ?? [],
		})
		.returning();

	if (!draft) {
		throw createError({
			status: 500,
			message: "Failed to create draft",
			why: "Insert returned no row",
			fix: "Retry the request",
		});
	}

	log.info(`[DRAFT] Created draft ${draft.id}`);
	return draft;
}

export async function updateDraftController(
	id: string,
	organizationId: string,
	updates: Partial<DraftFields>,
) {
	const log = useLogger();

	const existing = await db.query.composeDraft.findFirst({
		where: and(
			eq(composeDraft.id, id),
			eq(composeDraft.organizationId, organizationId),
		),
	});

	if (!existing) {
		throw createError({
			status: 404,
			message: "Draft not found",
			why: `Draft ${id} was not found`,
			fix: "Verify the draft ID",
		});
	}

	if (updates.mailboxId !== undefined) {
		await assertMailbox(updates.mailboxId, organizationId);
	}

	const [updated] = await db
		.update(composeDraft)
		.set({
			...(updates.mailboxId !== undefined
				? { mailboxId: updates.mailboxId }
				: {}),
			...(updates.kind !== undefined ? { kind: updates.kind } : {}),
			...(updates.threadId !== undefined ? { threadId: updates.threadId } : {}),
			...(updates.inReplyToMessageId !== undefined
				? { inReplyToMessageId: updates.inReplyToMessageId }
				: {}),
			...(updates.to !== undefined ? { to: updates.to } : {}),
			...(updates.cc !== undefined ? { cc: updates.cc } : {}),
			...(updates.bcc !== undefined ? { bcc: updates.bcc } : {}),
			...(updates.subject !== undefined ? { subject: updates.subject } : {}),
			...(updates.html !== undefined ? { html: updates.html } : {}),
			...(updates.text !== undefined ? { text: updates.text } : {}),
			...(updates.attachments !== undefined
				? { attachments: updates.attachments }
				: {}),
		})
		.where(eq(composeDraft.id, id))
		.returning();

	if (!updated) {
		throw createError({
			status: 500,
			message: "Failed to update draft",
			why: "Update returned no row",
			fix: "Retry the request",
		});
	}

	log.info(`[DRAFT] Updated draft ${id}`);
	return updated;
}

export async function deleteDraftController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	const existing = await db.query.composeDraft.findFirst({
		where: and(
			eq(composeDraft.id, id),
			eq(composeDraft.organizationId, organizationId),
		),
	});

	if (!existing) {
		throw createError({
			status: 404,
			message: "Draft not found",
			why: `Draft ${id} was not found`,
			fix: "Verify the draft ID",
		});
	}

	await db.delete(composeDraft).where(eq(composeDraft.id, id));
	log.info(`[DRAFT] Deleted draft ${id}`);
	return { success: true, id };
}
