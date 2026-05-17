import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function deleteApiKeyController({
	apiKeyId,
	organizationId,
}: {
	apiKeyId: string;
	organizationId: string;
}): Promise<{ id: string; message: string; object: "api_key"; event: string }> {
	const log = useLogger();
	log.info("Deleting API key");
	try {
		const [deleted] = await db
			.delete(schema.apikey)
			.where(
				and(
					eq(schema.apikey.id, apiKeyId),
					eq(schema.apikey.organizationId, organizationId),
				),
			)
			.returning({ id: schema.apikey.id });

		if (!deleted) {
			log.warn("API key not found");
			throw ApiKeyErrors.notFound(apiKeyId);
		}

		log.info("API key deleted successfully");

		await bus.publish(BusEvent.API_KEY_DELETED, {
			api_key_id: apiKeyId,
			organizationId,
		});
		log.info("NATS event published");

		const result = {
			id: apiKeyId,
			message: "API key deleted successfully",
			object: "api_key" as const,
			event: API_KEY_DELETE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Error deleting API key");
		throw error;
	}
}
