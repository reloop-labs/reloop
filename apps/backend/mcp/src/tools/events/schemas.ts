import * as z from "zod";
import type { WorkflowEvent } from "../../reloop/types";
import { resourceIdSchema } from "../contacts/schemas";

export const eventIdSchema = resourceIdSchema.describe(
	"Event ID as returned by Reloop, for example evt_123456789",
);

export const eventKeySchema = z
	.string()
	.trim()
	.min(1)
	.max(128)
	.describe(
		"Event key, for example user.signed_up. Keys are stored as trigger.<key>; the trigger. prefix is optional.",
	);

export const eventPropertyInputSchema = z.object({
	name: z
		.string()
		.regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)
		.max(128)
		.describe(
			"Property name in the tracked payload, for example plan. Conditions read it as trigger.<name>.",
		),
	propertyType: z.enum(["string", "number", "boolean"]).default("string"),
	required: z
		.boolean()
		.default(false)
		.describe("Tracking the event without it fails"),
	defaultValue: z
		.string()
		.max(2000)
		.nullable()
		.optional()
		.describe("Used when tracking leaves it out"),
	description: z.string().max(2000).nullable().optional(),
});

export const eventSchema = z.object({
	id: z.string(),
	name: z.string(),
	key: z.string().describe("Pass this as `event` to track_event"),
	description: z.string().nullable(),
	properties: z.array(
		z.object({
			name: z.string(),
			propertyType: z.enum(["string", "number", "boolean"]),
			required: z.boolean(),
			defaultValue: z.string().nullable(),
			description: z.string().nullable(),
		}),
	),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export function toEventOutput(
	event: WorkflowEvent,
): z.output<typeof eventSchema> {
	return {
		id: event.id,
		name: event.name,
		key: event.key,
		description: event.description,
		properties: event.properties.map((property) => ({
			name: property.name,
			propertyType: property.propertyType,
			required: property.required,
			defaultValue: property.defaultValue,
			description: property.description,
		})),
		createdAt: event.createdAt,
		updatedAt: event.updatedAt,
	};
}
