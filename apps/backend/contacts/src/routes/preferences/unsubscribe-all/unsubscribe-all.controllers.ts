import { AuthErrors } from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { verifyToken } from "../token.utils";

export async function unsubscribeAllController({ token }: { token: string }) {
	const log = useLogger();
	log.info("Processing unsubscribe all request");

	const payload = await verifyToken(token);
	if (!payload) {
		throw AuthErrors.unauthorized("Invalid or expired preferences token");
	}

	const { contactId, organizationId } = payload;

	// Get all active enrollments for this contact in this org
	const enrollments = await db.query.channelSubscription.findMany({
		where: and(
			eq(schema.channelSubscription.contactId, contactId),
			eq(schema.channelSubscription.organizationId, organizationId),
			isNull(schema.channelSubscription.deletedAt),
		),
	});

	// Batch update all to unenrolled
	if (enrollments.length > 0) {
		await db
			.update(schema.channelSubscription)
			.set({ status: "unenrolled", updatedAt: new Date() })
			.where(
				and(
					eq(schema.channelSubscription.contactId, contactId),
					eq(schema.channelSubscription.organizationId, organizationId),
					isNull(schema.channelSubscription.deletedAt),
				),
			);
	}

	log.info("Unsubscribed from all channels", {
		contactId,
		updatedCount: enrollments.length,
	});

	return {
		success: true,
		updatedCount: enrollments.length,
	};
}
