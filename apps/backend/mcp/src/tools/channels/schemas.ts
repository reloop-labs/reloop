import * as z from "zod";
import type { Channel } from "../../reloop/types";
import { resourceIdSchema } from "../contacts/schemas";

export const channelIdSchema = resourceIdSchema.describe(
	"Channel ID as returned by Reloop, for example chn_123456789",
);

export const subscriptionSchema = z.enum(["opt_in", "opt_out"]);

export const visibilitySchema = z.enum(["private", "public"]);

export const channelSettingsShape = {
	description: z
		.string()
		.trim()
		.max(1000)
		.optional()
		.describe("What subscribers receive on this channel"),
	defaultSubscription: subscriptionSchema
		.optional()
		.describe(
			"opt_in: contacts receive this channel until they unsubscribe. opt_out: contacts receive it only after opting in",
		),
	visibility: visibilitySchema
		.optional()
		.describe(
			"public channels appear on the contact's email preference page; private channels are internal",
		),
};

export const channelSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	defaultSubscription: subscriptionSchema,
	visibility: visibilitySchema,
	subscriberCount: z
		.number()
		.int()
		.nullable()
		.describe("Enrolled contacts; null when Reloop did not report it"),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export function toChannelOutput(
	channel: Channel,
): z.output<typeof channelSchema> {
	return {
		id: channel.id,
		name: channel.name,
		description: channel.description,
		defaultSubscription: channel.defaultSubscription,
		visibility: channel.visibility,
		subscriberCount: channel.subscriberCount ?? null,
		createdAt: channel.createdAt,
		updatedAt: channel.updatedAt,
	};
}
