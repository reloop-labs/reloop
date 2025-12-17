import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { formatApiKeyResponse } from "@reloop/api-key/routes/api-key/controllers/format-api-key-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function updateApiKey(
	apiKeyId: string,
	organizationId: string,
	userId: string,
	request: ApiKeyTypes.UpdateApiKeyRequest,
): Promise<ApiKeyTypes.ApiKeyResponse> {
	logger.info(
		{
			apiKeyId,
			organizationId,
			userId,
		},
		"Updating API key",
	);

	try {
		// Check if API key exists and belongs to user/organization
		const existing = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
				eq(schema.apikey.userId, userId),
			),
			with: {
				user: true,
			},
		});

		if (!existing) {
			logger.warn({ apiKeyId }, "API key not found");
			throw status(404, { message: "API key not found" });
		}

		// Build update object
		const updateData: Partial<typeof schema.apikey.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (request.name !== undefined) {
			updateData.name = request.name || null;
		}
		if (request.expiresAt !== undefined) {
			updateData.expiresAt = request.expiresAt
				? new Date(request.expiresAt)
				: null;
		}
		if (request.refillInterval !== undefined) {
			updateData.refillInterval = request.refillInterval ?? null;
		}
		if (request.refillAmount !== undefined) {
			updateData.refillAmount = request.refillAmount ?? null;
		}
		if (request.enabled !== undefined) {
			updateData.enabled = request.enabled;
		}
		if (request.rateLimitEnabled !== undefined) {
			updateData.rateLimitEnabled = request.rateLimitEnabled;
		}
		if (request.rateLimitTimeWindow !== undefined) {
			updateData.rateLimitTimeWindow = request.rateLimitTimeWindow;
		}
		if (request.rateLimitMax !== undefined) {
			updateData.rateLimitMax = request.rateLimitMax;
		}
		if (request.permissions !== undefined) {
			updateData.permissions = request.permissions ?? null;
		}
		if (request.metadata !== undefined) {
			updateData.metadata = request.metadata ?? null;
		}

		const updated = await db
			.update(schema.apikey)
			.set(updateData)
			.where(
				and(
					eq(schema.apikey.id, apiKeyId),
					eq(schema.apikey.organizationId, organizationId),
					eq(schema.apikey.userId, userId),
				),
			)
			.returning();

		if (!updated[0]) {
			logger.error({ apiKeyId }, "Failed to update API key");
			throw status(500, { message: "Failed to update API key" });
		}

		logger.info({ apiKeyId }, "API key updated successfully");
		return formatApiKeyResponse({
			...updated[0],
			createdBy: {
				id: existing.user.id,
				name: existing.user.name,
				image: existing.user.image,
				email: existing.user.email,
			},
		});
	} catch (error) {
		logger.error(
			{
				apiKeyId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error updating API key",
		);
		throw error;
	}
}

export async function updateApiKeyHandler(
	apiKeyId: string,
	organizationId: string,
	userId: string,
	body: ApiKeyTypes.UpdateApiKeyRequest,
): Promise<ApiKeyTypes.ApiKeyResponse> {
	logger.info({ apiKeyId, organizationId, userId }, "Updating API key");

	try {
		const apiKey = await updateApiKey(apiKeyId, organizationId, userId, body);
		logger.info(
			{ apiKeyId, organizationId, userId },
			"API key updated successfully",
		);
		return apiKey;
	} catch (error) {
		logger.error(
			{
				apiKeyId,
				organizationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error updating API key",
		);
		throw error;
	}
}
