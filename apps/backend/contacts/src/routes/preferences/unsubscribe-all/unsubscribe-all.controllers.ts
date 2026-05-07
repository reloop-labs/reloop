import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { verifyToken } from "../token.utils";

export async function unsubscribeAllController({
	token,
	logger,
}: {
	token: string;
	logger: Logger;
}) {
	logger.info("Processing unsubscribe all request");

	const payload = await verifyToken(token);
	if (!payload) {
		throw status(401, { message: "Invalid or expired preferences token" });
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

	logger.info(
		{ contactId, updatedCount: enrollments.length },
		"Unsubscribed from all channels",
	);

	return {
		success: true,
		updatedCount: enrollments.length,
	};
}
