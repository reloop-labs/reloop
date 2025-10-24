import { t } from "elysia";

export namespace AudienceModel {
    // Email validation pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Audience Group Models
    export const createAudienceGroupBody = t.Object({
        name: t.String({
            minLength: 1,
            maxLength: 255,
            description: "Audience group name",
        }),
        description: t.Optional(
            t.String({
                maxLength: 1000,
                description: "Audience group description",
            }),
        ),
    });

    export type CreateAudienceGroupBody = typeof createAudienceGroupBody.static;

    export const updateAudienceGroupBody = t.Object({
        name: t.Optional(
            t.String({
                minLength: 1,
                maxLength: 255,
                description: "Audience group name",
            }),
        ),
        description: t.Optional(
            t.String({
                maxLength: 1000,
                description: "Audience group description",
            }),
        ),
    });

    export type UpdateAudienceGroupBody = typeof updateAudienceGroupBody.static;

    export const audienceGroupResponse = t.Object({
        id: t.String({ description: "Unique audience group identifier" }),
        name: t.String({ description: "Audience group name" }),
        description: t.Union([t.String(), t.Null()], {
            description: "Audience group description",
        }),
        organizationId: t.String({ description: "Organization ID" }),
        userId: t.String({ description: "User ID" }),
        audienceCount: t.Number({ description: "Number of audiences in this group" }),
        subscribedCount: t.Number({ description: "Number of subscribed audiences" }),
        unsubscribedCount: t.Number({ description: "Number of unsubscribed audiences" }),
        deletedAt: t.Union([t.String(), t.Null()], {
            description: "Soft delete timestamp",
        }),
        createdAt: t.String(),
        updatedAt: t.String(),
    });

    export type AudienceGroupResponse = typeof audienceGroupResponse.static;

    export const audienceGroupListResponse = t.Object({
        audienceGroups: t.Array(audienceGroupResponse),
        total: t.Number(),
        page: t.Number(),
        limit: t.Number(),
    });

    export type AudienceGroupListResponse = typeof audienceGroupListResponse.static;

    export const audienceGroupQuery = t.Object({
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
        search: t.Optional(t.String({ description: "Search by name or description" })),
        organizationId: t.Optional(t.String()),
        userId: t.Optional(t.String()),
    });

    export type AudienceGroupQuery = typeof audienceGroupQuery.static;

    // Audience Models
    export const createAudienceBody = t.Object({
        email: t.String({
            pattern: emailPattern.source,
            description: "Audience email address",
        }),
        firstName: t.Optional(
            t.String({
                maxLength: 255,
                description: "Audience first name",
            }),
        ),
        lastName: t.Optional(
            t.String({
                maxLength: 255,
                description: "Audience last name",
            }),
        ),
        phone: t.Optional(
            t.String({
                maxLength: 50,
                description: "Audience phone number",
            }),
        ),
        metadata: t.Optional(
            t.Record(t.String(), t.Unknown(), {
                description: "Custom metadata for the audience",
            }),
        ),
        audienceGroupId: t.String({ description: "Audience group ID" }),
        status: t.Optional(
            t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
                default: "subscribed",
                description: "Audience subscription status",
            }),
        ),
    });

    export type CreateAudienceBody = typeof createAudienceBody.static;

    export const updateAudienceBody = t.Object({
        firstName: t.Optional(
            t.String({
                maxLength: 255,
                description: "Audience first name",
            }),
        ),
        lastName: t.Optional(
            t.String({
                maxLength: 255,
                description: "Audience last name",
            }),
        ),
        phone: t.Optional(
            t.String({
                maxLength: 50,
                description: "Audience phone number",
            }),
        ),
        metadata: t.Optional(
            t.Record(t.String(), t.Unknown(), {
                description: "Custom metadata for the audience",
            }),
        ),
        audienceGroupId: t.Optional(
            t.String({ description: "Audience group ID" }),
        ),
    });

    export type UpdateAudienceBody = typeof updateAudienceBody.static;

    export const audienceResponse = t.Object({
        id: t.String({ description: "Unique audience identifier" }),
        email: t.String({ description: "Audience email address" }),
        firstName: t.Union([t.String(), t.Null()], {
            description: "Audience first name",
        }),
        lastName: t.Union([t.String(), t.Null()], {
            description: "Audience last name",
        }),
        phone: t.Union([t.String(), t.Null()], {
            description: "Audience phone number",
        }),
        metadata: t.Union([t.Record(t.String(), t.Unknown()), t.Null()], {
            description: "Custom metadata for the audience",
        }),
        organizationId: t.String({ description: "Organization ID" }),
        status: t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
            description: "Audience subscription status",
        }),
        audienceGroupId: t.String({ description: "Audience group ID" }),
        audienceGroupName: t.String({ description: "Audience group name" }),
        addedAt: t.String({ description: "When audience was added" }),
        unsubscribedAt: t.Union([t.String(), t.Null()], {
            description: "When audience was unsubscribed",
        }),
        createdAt: t.String(),
        updatedAt: t.String(),
    });

    export type AudienceResponse = typeof audienceResponse.static;

    export const audienceListResponse = t.Object({
        audiences: t.Array(audienceResponse),
        total: t.Number(),
        page: t.Number(),
        limit: t.Number(),
    });

    export type AudienceListResponse = typeof audienceListResponse.static;

    export const audienceQuery = t.Object({
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
        search: t.Optional(t.String({ description: "Search by email, name, or metadata" })),
        status: t.Optional(
            t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")]),
        ),
        audienceGroupId: t.Optional(t.String()),
        organizationId: t.Optional(t.String()),
        userId: t.Optional(t.String()),
    });

    export type AudienceQuery = typeof audienceQuery.static;

    // Bulk Operations
    export const bulkImportAudiencesBody = t.Object({
        audienceGroupId: t.String({ description: "Audience group ID" }),
        audiences: t.Array(
            t.Object({
                email: t.String({
                    pattern: emailPattern.source,
                    description: "Audience email address",
                }),
                firstName: t.Optional(t.String({ maxLength: 255 })),
                lastName: t.Optional(t.String({ maxLength: 255 })),
                phone: t.Optional(t.String({ maxLength: 50 })),
                metadata: t.Optional(t.Record(t.String(), t.Unknown())),
                status: t.Optional(
                    t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
                        default: "subscribed",
                    }),
                ),
            }),
            { minItems: 1, maxItems: 1000, description: "List of audiences to import" },
        ),
    });

    export type BulkImportAudiencesBody = typeof bulkImportAudiencesBody.static;

    export const bulkImportResponse = t.Object({
        successful: t.Number({ description: "Number of successfully imported audiences" }),
        failed: t.Number({ description: "Number of failed imports" }),
        errors: t.Array(
            t.Object({
                email: t.String(),
                error: t.String(),
            }),
            { description: "List of import errors" },
        ),
    });

    export type BulkImportResponse = typeof bulkImportResponse.static;

    // Status Management
    export const subscribeAudienceBody = t.Object({
        reason: t.Optional(
            t.String({
                maxLength: 500,
                description: "Reason for subscription",
            }),
        ),
    });

    export type SubscribeAudienceBody = typeof subscribeAudienceBody.static;

    export const unsubscribeAudienceBody = t.Object({
        reason: t.Optional(
            t.String({
                maxLength: 500,
                description: "Reason for unsubscription",
            }),
        ),
    });

    export type UnsubscribeAudienceBody = typeof unsubscribeAudienceBody.static;

    // Search Models
    export const searchAudiencesQuery = t.Object({
        query: t.String({
            minLength: 1,
            description: "Search query",
        }),
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
        status: t.Optional(
            t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")]),
        ),
        audienceGroupId: t.Optional(t.String()),
        organizationId: t.Optional(t.String()),
    });

    export type SearchAudiencesQuery = typeof searchAudiencesQuery.static;

    // Error Responses
    export const audienceGroupNotFound = t.Object({
        message: t.Literal("Audience group not found"),
    });
    export type AudienceGroupNotFound = typeof audienceGroupNotFound.static;

    export const audienceNotFound = t.Object({
        message: t.Literal("Audience not found"),
    });
    export type AudienceNotFound = typeof audienceNotFound.static;

    export const audienceAlreadyExists = t.Object({
        message: t.Literal("Audience already exists in this group"),
    });
    export type AudienceAlreadyExists = typeof audienceAlreadyExists.static;

    export const invalidEmail = t.Object({
        message: t.Literal("Invalid email format"),
    });
    export type InvalidEmail = typeof invalidEmail.static;

    export const unauthorized = t.Object({
        message: t.Literal("Unauthorized access"),
    });
    export type Unauthorized = typeof unauthorized.static;

    export const validationError = t.Object({
        message: t.String(),
        errors: t.Array(
            t.Object({
                field: t.String(),
                message: t.String(),
            }),
        ),
    });
    export type ValidationError = typeof validationError.static;
}
