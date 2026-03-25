import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getTopic(
	contactTopicId: string,
	organizationId: string,
	logger: Logger,
): Promise<TopicTypes.TopicResponse> {
	logger.info({ contactTopicId, organizationId }, "Getting topic");
	try {
		const result = await db.query.topic.findFirst({
			where: and(
				eq(schema.topic.id, contactTopicId),
				eq(schema.topic.organizationId, organizationId),
				isNull(schema.topic.deletedAt),
			),
		});

		if (!result) {
			logger.warn({ contactTopicId }, "Topic not found");
			throw status(404, { message: "Topic not found" });
		}

		logger.info({ contactTopicId }, "Topic retrieved successfully");
		const { organizationId: _, deletedAt: __, ...responseTopic } = result;
		return { ...responseTopic, object: "topic" as const };
	} catch (error) {
		logger.error(
			{
				contactTopicId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting topic",
		);
		throw error;
	}
}

export async function getTopicHandler(
	contactTopicId: string,
	organizationId: string,
	logger: Logger,
): Promise<TopicTypes.TopicResponse> {
	return await getTopic(contactTopicId, organizationId, logger);
}
