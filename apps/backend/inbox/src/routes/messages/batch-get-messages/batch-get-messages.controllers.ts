import { db } from "@reloop/db/client";
import { inboundEmail } from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createError } from "evlog";

export async function batchGetMessagesController(
	organizationId: string,
	ids: string[],
) {
	if (ids.length === 0) return [];
	if (ids.length > 100) {
		throw createError({
			status: 400,
			message: "Too many IDs",
			why: "Batch get supports a maximum of 100 message IDs at once",
			fix: "Reduce the number of IDs in your request",
		});
	}

	const messages = await db.query.inboundEmail.findMany({
		where: and(
			eq(inboundEmail.organizationId, organizationId),
			inArray(inboundEmail.id, ids),
		),
		with: {
			attachments: true,
		},
	});

	return messages;
}
