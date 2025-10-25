import type { AudienceTypes } from "@reloop/audience/routes/audience/audience.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function bulkImportAudiences(
    organizationId: string,
    body: AudienceTypes.BulkImportAudiencesRequest,
): Promise<AudienceTypes.BulkImportResponse> {
    logger.info(
        {
            audienceGroupId: body.audienceGroupId,
            audienceCount: body.audiences.length,
            organizationId,
        },
        "Bulk importing audiences",
    );

    try {
        // Check if audience group exists and belongs to organization
        const audienceGroup = await db.query.audienceGroup.findFirst({
            where: and(
                eq(schema.audienceGroup.id, body.audienceGroupId),
                eq(schema.audienceGroup.organizationId, organizationId),
                isNull(schema.audienceGroup.deletedAt),
            ),
        });

        if (!audienceGroup) {
            logger.warn(
                { audienceGroupId: body.audienceGroupId, organizationId },
                "Audience group not found",
            );
            throw status(404, { message: "Audience group not found" });
        }

        // Get existing audiences in this group to avoid duplicates
        const existingAudiences = await db
            .select({ email: schema.audience.email })
            .from(schema.audience)
            .where(
                and(
                    eq(schema.audience.audienceGroupId, body.audienceGroupId),
                    eq(schema.audience.organizationId, organizationId),
                ),
            );

        const existingEmails = new Set(existingAudiences.map((a) => a.email));

        // Filter out duplicates and prepare data for insertion
        const audiencesToInsert = body.audiences
            .filter((audience) => !existingEmails.has(audience.email))
            .map((audience) => ({
                email: audience.email,
                firstName: audience.firstName || null,
                lastName: audience.lastName || null,
                phone: audience.phone || null,
                metadata: audience.metadata || null,
                organizationId,
                audienceGroupId: body.audienceGroupId,
                status: audience.status || "subscribed",
                addedAt: new Date(),
                unsubscribedAt: audience.status === "unsubscribed" ? new Date() : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

        const errors: AudienceTypes.BulkImportError[] = body.audiences
            .filter((audience) => existingEmails.has(audience.email))
            .map((audience) => ({
                email: audience.email,
                error: "Audience already exists in this group",
            }));

        let successful = 0;
        let failed = 0;

        if (audiencesToInsert.length > 0) {
            try {
                await db.insert(schema.audience).values(audiencesToInsert);
                successful = audiencesToInsert.length;
                logger.info(
                    {
                        audienceGroupId: body.audienceGroupId,
                        successful,
                        organizationId,
                    },
                    "Bulk import successful",
                );
            } catch (insertError) {
                logger.error(
                    {
                        audienceGroupId: body.audienceGroupId,
                        error:
                            insertError instanceof Error
                                ? insertError.message
                                : String(insertError),
                        organizationId,
                    },
                    "Bulk import failed",
                );
                failed = audiencesToInsert.length;
                errors.push({
                    email: "Bulk import failed",
                    error:
                        insertError instanceof Error
                            ? insertError.message
                            : "Unknown error",
                });
            }
        }

        failed += errors.length;

        logger.info(
            {
                audienceGroupId: body.audienceGroupId,
                successful,
                failed,
                organizationId,
            },
            "Bulk import completed",
        );

        return {
            successful,
            failed,
            errors,
        };
    } catch (error) {
        logger.error(
            {
                audienceGroupId: body.audienceGroupId,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error during bulk import",
        );
        throw error;
    }
}

export async function bulkImportAudiencesHandler(
    organizationId: string,
    body: AudienceTypes.BulkImportAudiencesRequest,
): Promise<AudienceTypes.BulkImportResponse> {
    return bulkImportAudiences(organizationId, body);
}
