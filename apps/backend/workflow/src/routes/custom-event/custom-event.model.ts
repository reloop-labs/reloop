import { t } from "elysia";

const propertyType = t.Union([
	t.Literal("string"),
	t.Literal("number"),
	t.Literal("boolean"),
]);

const propertyInput = t.Object({
	name: t.String({
		minLength: 1,
		maxLength: 128,
		pattern: "^[a-zA-Z][a-zA-Z0-9_]*$",
		description: "Property key in the track payload",
	}),
	propertyType: t.Optional(propertyType),
	required: t.Optional(t.Boolean()),
	defaultValue: t.Optional(t.Union([t.String(), t.Null()])),
	description: t.Optional(t.Union([t.String(), t.Null()])),
});

const propertyResponse = t.Object({
	id: t.String(),
	name: t.String(),
	propertyType: propertyType,
	required: t.Boolean(),
	defaultValue: t.Nullable(t.String()),
	description: t.Nullable(t.String()),
	createdAt: t.String(),
	updatedAt: t.String(),
});

export namespace CustomEventModel {
	export const createBody = t.Object({
		name: t.String({ minLength: 1, maxLength: 255 }),
		key: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 128,
				description: "Machine key (defaults from name)",
			}),
		),
		description: t.Optional(t.String({ maxLength: 2000 })),
		properties: t.Optional(t.Array(propertyInput, { maxItems: 50 })),
	});

	export const updateBody = t.Object({
		name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
		description: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
		/** Full replace of property schema when provided */
		properties: t.Optional(t.Array(propertyInput, { maxItems: 50 })),
	});

	export const listQuery = t.Object({
		page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 50 })),
	});

	export const eventResponse = t.Object({
		id: t.String(),
		organizationId: t.String(),
		name: t.String(),
		key: t.String(),
		description: t.Nullable(t.String()),
		properties: t.Array(propertyResponse),
		createdAt: t.String(),
		updatedAt: t.String(),
	});

	export const eventListResponse = t.Object({
		events: t.Array(eventResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export const trackBody = t.Object({
		event: t.String({
			minLength: 1,
			maxLength: 128,
			description: "Workflow custom event key",
		}),
		contactId: t.Optional(t.String()),
		email: t.Optional(t.String({ format: "email" })),
		properties: t.Optional(t.Record(t.String(), t.Unknown())),
	});

	export const trackResponse = t.Object({
		success: t.Boolean(),
		eventId: t.String(),
		eventKey: t.String(),
		contactId: t.String(),
		enrollments: t.Number(),
		properties: t.Record(t.String(), t.Unknown()),
	});

	export const deleteResponse = t.Object({
		success: t.Boolean(),
		id: t.String(),
	});

	export const evlogError = t.Object({
		message: t.String(),
		why: t.Optional(t.String()),
		fix: t.Optional(t.String()),
		link: t.Optional(t.String()),
	});
}
