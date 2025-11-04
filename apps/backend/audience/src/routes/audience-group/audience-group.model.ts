import { t } from "elysia";

export namespace AudienceGroupModel {
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
		audienceCount: t.Number({
			description: "Number of audiences in this group",
		}),
		subscribedCount: t.Number({
			description: "Number of subscribed audiences",
		}),
		unsubscribedCount: t.Number({
			description: "Number of unsubscribed audiences",
		}),
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

	export type AudienceGroupListResponse =
		typeof audienceGroupListResponse.static;

	export const audienceGroupQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		search: t.Optional(
			t.String({ description: "Search by name or description" }),
		),
		organizationId: t.Optional(t.String()),
		userId: t.Optional(t.String()),
	});

	export type AudienceGroupQuery = typeof audienceGroupQuery.static;

	// Error Responses
	export const audienceGroupNotFound = t.Object({
		message: t.Literal("Audience group not found"),
	});
	export type AudienceGroupNotFound = typeof audienceGroupNotFound.static;

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
