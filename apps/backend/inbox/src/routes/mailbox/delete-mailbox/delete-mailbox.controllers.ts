import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function deleteMailboxController(
	id: string,
	organizationId: string,
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

	await db.delete(mailbox).where(eq(mailbox.id, id));

	await bus.publish(BusEvent.MAILBOX_DELETED, {
		mailboxId: id,
		organizationId,
		email: mbx.email,
	});

	log.info(`[MAILBOX] Deleted mailbox ${mbx.email} (Org: ${organizationId})`);
	return { success: true };
}
