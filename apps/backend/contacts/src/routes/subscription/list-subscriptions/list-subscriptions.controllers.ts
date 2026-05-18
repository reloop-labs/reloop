import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listSubscriptionsController({
	organizationId,
	query,
	logger,
}: {
	organizationId: string;
	query: { channelId: string; limit?: number; page?: number };
	logger?: any;
}) {
	logger?.info("Listing subscriptions", { ...query });
	try {
		const page = query.page || 1;
		const limit = Math.min(query.limit || 100, 100);
		const offset = (page - 1) * limit;

		const whereConditions = [
			eq(schema.channelSubscription.organizationId, organizationId),
			eq(schema.channelSubscription.channelId, query.channelId),
			isNull(schema.channelSubscription.deletedAt),
		];

		const totalResult = await db
			.select({ count: count() })
			.from(schema.channelSubscription)
			.where(and(...whereConditions));
		const total = totalResult[0]?.count || 0;

		const subscriptions = await db.query.channelSubscription.findMany({
			where: and(...whereConditions),
			orderBy: desc(schema.channelSubscription.createdAt),
			limit,
			offset,
		});

		logger?.info("Subscriptions listed successfully", { total, page, limit });

		return {
			object: "subscription" as const,
			subscriptions,
			total,
			page,
			limit,
		};
	} catch (error) {
		logger?.error("Error listing subscriptions", { query, error });
		throw error;
	}
}
