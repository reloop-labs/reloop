import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";

export async function getMailboxController(id: string, organizationId: string) {
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

	return {
		id: mbx.id,
		email: mbx.email,
		quota: mbx.quota,
		status: mbx.status,
		displayName: mbx.displayName,
		domainId: mbx.domainId,
		createdAt: mbx.createdAt,
		updatedAt: mbx.updatedAt,
	};
}
