import * as z from "zod";
import {
	contactTargetMessage,
	contactTargetShape,
	hasContactTarget,
} from "../automations/schemas";
import { defineTool } from "../define";
import { eventKeySchema } from "./schemas";

export const trackEvent = defineTool({
	name: "track_event",
	title: "Track event",
	description:
		"Report that a custom event happened to a contact, which starts every active automation it triggers for them and can send real email right away; confirm with the user first. Pass contactId, or email to create the contact if needed. Required properties must be included (see get_event). The result's `enrollments` is how many automations started; 0 usually means none are active for this event or the contact already went through them (automations whose reentry is restart or parallel start again).",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: true,
	},
	input: z
		.object({
			event: eventKeySchema,
			...contactTargetShape,
			properties: z
				.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
				.optional()
				.describe(
					"Values for the event's properties, for example { plan: 'pro' }",
				),
		})
		.refine(hasContactTarget, { message: contactTargetMessage }),
	output: z.object({
		eventKey: z.string(),
		contactId: z.string(),
		contactCreated: z.boolean(),
		enrollments: z.number().int().describe("How many automations started"),
		properties: z.record(z.string(), z.unknown()),
	}),
	async run(args, api) {
		const response = await api.workflowEvents.track(args);
		return {
			eventKey: response.eventKey,
			contactId: response.contactId,
			contactCreated: response.contactCreated,
			enrollments: response.enrollments,
			properties: response.properties,
		};
	},
});
