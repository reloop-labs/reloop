import { db } from "@reloop/db/client";
import { inboxMailboxSelection, mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";

export type SelectedMailbox = {
	mailboxId: string | null;
	folder: string | null;
};

export async function getSelectedMailboxController(
	userId: string,
	organizationId: string,
): Promise<SelectedMailbox> {
	const selection = await db.query.inboxMailboxSelection.findFirst({
		where: and(
			eq(inboxMailboxSelection.userId, userId),
			eq(inboxMailboxSelection.organizationId, organizationId),
		),
	});

	if (!selection) {
		return { mailboxId: null, folder: null };
	}

	// Mailbox may have been deleted or moved to another org (shared orgs).
	// Cascade delete normally removes the row, but guard against stale data.
	const mbx = await db.query.mailbox.findFirst({
		where: and(
			eq(mailbox.id, selection.mailboxId),
			eq(mailbox.organizationId, organizationId),
		),
	});

	if (!mbx) {
		await db
			.delete(inboxMailboxSelection)
			.where(
				and(
					eq(inboxMailboxSelection.userId, userId),
					eq(inboxMailboxSelection.organizationId, organizationId),
				),
			);
		return { mailboxId: null, folder: null };
	}

	return { mailboxId: selection.mailboxId, folder: selection.folder };
}

export async function saveSelectedMailboxController(
	userId: string,
	organizationId: string,
	mailboxId: string,
	folder?: string,
): Promise<SelectedMailbox> {
	const mbx = await db.query.mailbox.findFirst({
		where: and(
			eq(mailbox.id, mailboxId),
			eq(mailbox.organizationId, organizationId),
		),
	});

	if (!mbx) {
		throw createError({
			status: 404,
			message: "Mailbox not found",
			why: `Mailbox ${mailboxId} was not found in your organization`,
			fix: "Verify the mailbox ID and ensure it belongs to your organization",
		});
	}

	const normalizedFolder = (folder ?? "inbox").slice(0, 64) || "inbox";

	await db
		.insert(inboxMailboxSelection)
		.values({
			userId,
			organizationId,
			mailboxId,
			folder: normalizedFolder,
		})
		.onConflictDoUpdate({
			target: [
				inboxMailboxSelection.userId,
				inboxMailboxSelection.organizationId,
			],
			set: {
				mailboxId,
				folder: normalizedFolder,
				updatedAt: new Date(),
			},
		});

	return { mailboxId, folder: normalizedFolder };
}
