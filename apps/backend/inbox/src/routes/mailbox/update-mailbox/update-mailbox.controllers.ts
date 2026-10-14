import { assertCanActivateInbox } from "@reloop/be-inbox/lib/inbox-quota";
import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function updateMailboxController(
	id: string,
	organizationId: string,
	updates: {
		displayName?: string;
		status?: "active" | "disabled";
		quota?: string;
	},
) {
	const log = useLogger();

	const mbx = await db.query.mailbox.findFirst({
		where: and(eq(mailbox.id, id), eq(mailbox.organizationId, organizationId)),
	});

	if (!mbx) {
		throw createError({
			status: 404,
			message: "Mailbox not found",
			why: `Mailbox ${id} was not found in your organization`,
			fix: "Verify the mailbox ID and ensure it belongs to your organization",
		});
	}

	const updateData: Partial<typeof mailbox.$inferInsert> = {};
	if (updates.displayName !== undefined)
		updateData.displayName = updates.displayName;

	if (updates.status !== undefined) updateData.status = updates.status;
	if (updates.quota !== undefined) updateData.quota = updates.quota;

	if (Object.keys(updateData).length === 0) {
		return { success: true, id, message: "No changes" };
	}

	await db.transaction(async (tx) => {
		// Re-enabling (incl. a plan-suspended inbox) must fit the plan cap
		if (updates.status === "active" && mbx.status !== "active") {
			await assertCanActivateInbox(organizationId, id, tx);
		}
		await tx.update(mailbox).set(updateData).where(eq(mailbox.id, id));
	});

	log.info(`[MAILBOX] Updated mailbox ${id}: ${JSON.stringify(updateData)}`);
	return { success: true, id, ...updateData };
}
