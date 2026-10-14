import * as z from "zod";
import { paginationSchema } from "../automations/schemas";
import { defineTool } from "../define";
import { eventSchema, toEventOutput } from "./schemas";

export const listEvents = defineTool({
	name: "list_events",
	title: "List events",
	description:
		"List the organization's custom events (shown as Triggers in the dashboard) with their keys and properties. A custom event is something the app reports, such as a sign-up or an order, that starts automations. These are not webhook events. Use this to find the key for an automation's trigger step or for track_event.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		page: z.number().int().min(1).default(1).describe("1-based page number"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(20)
			.describe("Events per page, 1 to 100"),
	}),
	output: z.object({
		events: z.array(eventSchema),
		pagination: paginationSchema,
	}),
	async run(args, api) {
		const response = await api.workflowEvents.list({
			page: args.page,
			limit: args.limit,
		});
		return {
			events: response.events.map(toEventOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
