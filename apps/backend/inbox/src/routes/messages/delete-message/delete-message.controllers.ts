import { db } from "@reloop/db/client";
import { inboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function deleteMessageController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	const msg = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, id),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	if (!msg) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	await db.delete(inboundEmail).where(eq(inboundEmail.id, id));

	log.info(`[INBOX] Deleted message ${id} (Org: ${organizationId})`);
	return { success: true };
}
