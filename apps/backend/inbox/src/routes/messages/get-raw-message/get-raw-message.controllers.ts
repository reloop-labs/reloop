import { db } from "@reloop/db/client";
import { inboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";

export async function getRawMessageController(
	id: string,
	organizationId: string,
) {
	const message = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, id),
			eq(inboundEmail.organizationId, organizationId),
		),
		columns: {
			rawMessage: true,
			messageId: true,
		},
	});

	if (!message) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	if (!message.rawMessage) {
		throw createError({
			status: 404,
			message: "Raw message not available",
			why: "The raw RFC822 message was not stored for this email",
			fix: "Raw message storage may be disabled for this mailbox",
		});
	}

	return {
		id,
		messageId: message.messageId,
		raw: message.rawMessage,
	};
}
