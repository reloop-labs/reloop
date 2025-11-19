import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function retryDelivery(
	deliveryId: string,
	organizationId: string,
	force = false,
): Promise<{ message: string }> {
	logger.info(
		{
			deliveryId,
			organizationId,
			force,
		},
		"Retrying delivery",
	);

	try {
		const delivery = await db.query.webhookDelivery.findFirst({
			where: and(
				eq(schema.webhookDelivery.id, deliveryId),
				eq(schema.webhook.organizationId, organizationId),
			),
			with: {
				webhook: true,
				event: true,
			},
		});

		if (!delivery) {
			logger.warn({ deliveryId, organizationId }, "Delivery not found");
			throw status(404, { message: "Delivery not found" });
		}

		// Check if retry is allowed
		if (!force && delivery.attemptNumber >= delivery.maxAttempts) {
			logger.warn(
				{
					deliveryId,
					attemptNumber: delivery.attemptNumber,
					maxAttempts: delivery.maxAttempts,
				},
				"Retry not allowed - max attempts reached",
			);
			throw status(400, {
				message: "Retry not allowed - max attempts reached",
			});
		}

		// Update delivery status to retrying and trigger Inngest
		await db
			.update(schema.webhookDelivery)
			.set({
				status: "retrying",
				nextRetryAt: new Date(),
			})
			.where(eq(schema.webhookDelivery.id, deliveryId));


		logger.info(
			{
				deliveryId,
				organizationId,
			},
			"Delivery retry initiated successfully via Inngest",
		);

		return { message: "Delivery retry initiated successfully" };
	} catch (error) {
		logger.error(
			{
				deliveryId,
				organizationId,
				force,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error retrying delivery",
		);
		throw error;
	}
}

export async function retryDeliveryHandler(
	deliveryId: string,
	organizationId: string,
	body: { force?: boolean },
): Promise<{ message: string }> {
	logger.info(
		{
			deliveryId,
			organizationId,
			force: body.force,
		},
		"Retrying delivery",
	);

	try {
		const result = await retryDelivery(deliveryId, organizationId, body.force);

		logger.info(
			{
				deliveryId,
				organizationId,
			},
			"Delivery retry initiated successfully",
		);

		return result;
	} catch (error) {
		logger.error(
			{
				deliveryId,
				organizationId,
				force: body.force,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error retrying delivery",
		);
		throw error;
	}
}
