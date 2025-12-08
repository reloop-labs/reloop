import { t } from "elysia";

export namespace AudienceModel {
	// Email validation pattern
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
		organizationId: t.String({ description: "Organization ID" }),
		createdAt: t.Date(),
		updatedAt: t.Date(),
		deletedAt: t.Union([t.Date(), t.Null()]),
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
		search: t.Optional(t.String({ description: "Search by email or name" })),
		organizationId: t.Optional(t.String()),
	});

	export type AudienceQuery = typeof audienceQuery.static;

	// Search Models
	export const searchAudiencesQuery = t.Object({
		query: t.String({
			minLength: 1,
			description: "Search query",
		}),
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		organizationId: t.Optional(t.String()),
	});

	export type SearchAudiencesQuery = typeof searchAudiencesQuery.static;

	// Delete Response
	export const deleteResponse = t.Object({
		success: t.Boolean(),
	});

	export type DeleteResponse = typeof deleteResponse.static;

	// Error Responses
	export const audienceNotFound = t.Object({
		message: t.Literal("Audience not found"),
	});
	export type AudienceNotFound = typeof audienceNotFound.static;

	export const audienceAlreadyExists = t.Object({
		message: t.Literal("Audience already exists"),
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
