import { workflowErrorExample as errorExample } from "@be/workflow/routes/automation/automation.model";
import { t } from "elysia";

// Examples shown in the API reference.
const exampleEvent = {
	id: "evt_123456789",
	organizationId: "org_123456789",
	name: "User signed up",
	key: "trigger.user.signed_up",
	description: "Fired when an account is created",
	properties: [
		{
			id: "evtp_123456789",
			name: "plan",
			propertyType: "string",
			required: true,
			defaultValue: null,
			description: "The plan they picked",
			createdAt: "2026-03-23T10:00:00.000Z",
			updatedAt: "2026-03-23T10:00:00.000Z",
		},
	],
	createdAt: "2026-03-23T10:00:00.000Z",
	updatedAt: "2026-03-23T10:00:00.000Z",
};

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
	propertyType: t.Optional(
		t.Union(propertyType.anyOf, { description: 'Defaults to "string"' }),
	),
	required: t.Optional(
		t.Boolean({ description: "Tracking without it fails. Defaults to false." }),
	),
	defaultValue: t.Optional(
		t.Union([t.String(), t.Null()], {
			description: "Used when tracking leaves the property out",
		}),
	),
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
		name: t.String({
			minLength: 1,
			maxLength: 255,
			description: "Display name, e.g. User signed up",
		}),
		key: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 128,
				description:
					'What you pass when tracking. Made from the name if left out; "trigger." is added in front if missing.',
			}),
		),
		description: t.Optional(t.String({ maxLength: 2000 })),
		properties: t.Optional(
			t.Array(propertyInput, {
				maxItems: 50,
				description: "Properties the event can carry",
			}),
		),
	});

	export const updateBody = t.Object({
		name: t.Optional(
			t.String({ minLength: 1, maxLength: 255, description: "Display name" }),
		),
		description: t.Optional(
			t.Union([t.String({ maxLength: 2000 }), t.Null()], {
				description: "Description, or null to clear it",
			}),
		),
		/** Full replace of property schema when provided */
		properties: t.Optional(
			t.Array(propertyInput, {
				maxItems: 50,
				description: "Replaces every property",
			}),
		),
	});

	export const listQuery = t.Object({
		page: t.Optional(
			t.Numeric({ minimum: 1, default: 1, description: "Page number" }),
		),
		limit: t.Optional(
			t.Numeric({
				minimum: 1,
				maximum: 100,
				default: 50,
				description: "Events per page",
			}),
		),
	});

	export const eventResponse = t.Object(
		{
			id: t.String(),
			organizationId: t.String(),
			name: t.String(),
			key: t.String(),
			description: t.Nullable(t.String()),
			properties: t.Array(propertyResponse),
			createdAt: t.String(),
			updatedAt: t.String(),
		},
		{ examples: [exampleEvent] },
	);

	export const eventListResponse = t.Object(
		{
			events: t.Array(eventResponse),
			total: t.Number(),
			page: t.Number(),
			limit: t.Number(),
		},
		{ examples: [{ events: [exampleEvent], total: 1, page: 1, limit: 50 }] },
	);

	export const trackBody = t.Object({
		event: t.String({
			minLength: 1,
			maxLength: 128,
			description:
				'The event key, e.g. user.signed_up. The "trigger." prefix is optional.',
		}),
		contactId: t.Optional(
			t.String({
				description: "Contact the event happened to. Pass this or email.",
			}),
		),
		email: t.Optional(
			t.String({
				format: "email",
				description:
					"Contact email. Creates the contact if it does not exist yet.",
			}),
		),
		firstName: t.Optional(
			t.String({
				maxLength: 255,
				description: "Used when the contact is created from email",
			}),
		),
		lastName: t.Optional(
			t.String({
				maxLength: 255,
				description: "Used when the contact is created from email",
			}),
		),
		properties: t.Optional(
			t.Record(t.String(), t.Unknown(), {
				description:
					"Values for the event's properties. Conditions read them as trigger.<name>.",
			}),
		),
	});

	export const trackResponse = t.Object(
		{
			success: t.Boolean(),
			eventId: t.String(),
			eventKey: t.String(),
			contactId: t.String(),
			contactCreated: t.Boolean(),
			enrollments: t.Number({
				description: "How many automations this started",
			}),
			properties: t.Record(t.String(), t.Unknown()),
		},
		{
			examples: [
				{
					success: true,
					eventId: "evt_123456789",
					eventKey: "trigger.user.signed_up",
					contactId: "con_123456789",
					contactCreated: false,
					enrollments: 1,
					properties: { plan: "pro" },
				},
			],
		},
	);

	export const deleteResponse = t.Object(
		{
			success: t.Boolean(),
			id: t.String(),
		},
		{ examples: [{ success: true, id: "evt_123456789" }] },
	);

	export const errors = {
		unauthorized: errorExample("Authentication required"),
		notFound: errorExample(
			"Event not found",
			'No custom event "trigger.user.signed_up" exists for your organization.',
			"Create the event first, or verify the key / ID.",
		),
		keyExists: errorExample(
			"Event key already exists",
			'An event with key "trigger.user.signed_up" already exists in this organization.',
			"Use a different key or update the existing event.",
		),
		invalidKey: errorExample(
			"Invalid event key",
			'The key "trigger.User Signed Up" is not valid.',
			"Use lowercase letters, numbers, dots, underscores, or hyphens (e.g. trigger.signed_up). Keys must start with trigger.",
		),
		invalidProperties: errorExample(
			"Invalid event properties",
			'Missing required property "plan".',
			"Fix property names/types and try again.",
		),
		internal: errorExample(
			"Failed to update event",
			"An unexpected error occurred while updating the event.",
			"Please try again later.",
		),
	};

	export const evlogError = t.Object({
		message: t.String(),
		why: t.Optional(t.String()),
		fix: t.Optional(t.String()),
		link: t.Optional(t.String()),
	});
}
