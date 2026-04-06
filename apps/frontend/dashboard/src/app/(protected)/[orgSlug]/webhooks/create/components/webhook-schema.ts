import * as v from "valibot";

export const webhookSchema = v.object({
	url: v.pipe(
		v.string("URL is required"),
		v.minLength(1, "URL is required"),
		v.regex(
			/^https?:\/\/.+/,
			"Please enter a valid URL starting with http:// or https://",
		),
	),
	description: v.optional(v.string()),
	events: v.pipe(
		v.array(v.string("Events are required")),
		v.minLength(1, "At least one event is required"),
	),
});

export type WebhookFormValues = v.InferInput<typeof webhookSchema>;
