import { formatApiKeyResponse } from "@reloop/api-key/routes/api-key/controllers/format-api-key-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function disableApiKey(
  id: string,
  organizationId: string,
  userId: string,
): Promise<ApiKeyTypes.ApiKeyResponse> {
  try {
    // Verify the API key exists and belongs to the user/org
    const existingKey = await db.query.apikey.findFirst({
      where: and(
        eq(schema.apikey.id, id),
        eq(schema.apikey.organizationId, organizationId),
      ),
      with: {
        user: true,
      },
    });

    if (!existingKey) {
      logger.warn({ id, organizationId, userId }, "API key not found");
      throw status(404, { message: "API key not found" });
    }

    if (!existingKey.enabled) {
      logger.info({ id }, "API key is already disabled");
      return formatApiKeyResponse({
        ...existingKey,
        createdBy: {
          id: existingKey.user.id,
          name: existingKey.user.name,
          image: existingKey.user.image,
          email: existingKey.user.email,
        },
      });
    }

    const now = new Date();

    const [updatedKey] = await db
      .update(schema.apikey)
      .set({
        enabled: false,
        updatedAt: now,
      })
      .where(eq(schema.apikey.id, id))
      .returning();

    if (!updatedKey) {
      logger.error({ id }, "Failed to disable API key");
      throw status(500, { message: "Failed to disable API key" });
    }

    logger.info({ id, organizationId, userId }, "API key disabled successfully");

    return formatApiKeyResponse({
      ...updatedKey,
      createdBy: {
        id: existingKey.user.id,
        name: existingKey.user.name,
        image: existingKey.user.image,
        email: existingKey.user.email,
      },
    });
  } catch (error) {
    logger.error(
      {
        id,
        organizationId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error disabling API key",
    );
    throw error;
  }
}

export async function disableApiKeyHandler(
  id: string,
  organizationId: string,
  userId: string,
): Promise<ApiKeyTypes.ApiKeyResponse> {
  logger.info({ id, organizationId, userId }, "Disabling API key");
  return disableApiKey(id, organizationId, userId);
}
