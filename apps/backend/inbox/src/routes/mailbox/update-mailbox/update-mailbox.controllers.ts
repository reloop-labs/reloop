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
		description?: string;
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

	const updateData: Record<string, any> = {};
	if (updates.displayName !== undefined)
		updateData.displayName = updates.displayName;
	if (updates.description !== undefined)
		updateData.description = updates.description;
	if (updates.status !== undefined) updateData.status = updates.status;
	if (updates.quota !== undefined) updateData.quota = updates.quota;

	if (Object.keys(updateData).length === 0) {
		return { success: true, id, message: "No changes" };
	}

	await db.update(mailbox).set(updateData).where(eq(mailbox.id, id));

	log.info(`[MAILBOX] Updated mailbox ${id}: ${JSON.stringify(updateData)}`);
	return { success: true, id, ...updateData };
}
