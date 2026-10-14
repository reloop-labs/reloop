import * as z from "zod";
import { defineTool } from "../define";
import {
	automationSchema,
	paginationSchema,
	toAutomationOutput,
} from "./schemas";

export const listAutomations = defineTool({
	name: "list_automations",
	title: "List automations",
	description:
		"List the organization's automations, most recently updated first, with their status, trigger event, steps and connections. An automation sends emails to a contact when the app tracks its trigger event (a custom event such as trigger.user.signed_up). Use this to find an automation ID before get_automation, update_automation or list_enrollments.",
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
			.describe("Automations per page, 1 to 100"),
	}),
	output: z.object({
		automations: z.array(automationSchema),
		pagination: paginationSchema,
	}),
	async run(args, api) {
		const response = await api.automations.list({
			page: args.page,
			limit: args.limit,
		});
		return {
			automations: response.automations.map(toAutomationOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
