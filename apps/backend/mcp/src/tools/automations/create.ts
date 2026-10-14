import * as z from "zod";
import { defineTool } from "../define";
import {
	automationSchema,
	connectionSchema,
	stepSchema,
	stepsDescription,
	toAutomationOutput,
} from "./schemas";

export const createAutomation = defineTool({
	name: "create_automation",
	title: "Create automation",
	description:
		"Create an automation as a draft from steps and the connections between them. It does not run until activate_automation is called. Build it as: one trigger step whose eventName is a custom event key (find or create one with list_events / create_event), then send_email steps (template IDs from list_templates), delay steps and condition steps. Connect steps by key; a condition needs one condition_met and one condition_not_met connection. When the steps are invalid the error's `why` lists every problem at once.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({
		name: z.string().trim().min(1).max(255).describe("Automation name"),
		description: z.string().max(2000).optional(),
		steps: z.array(stepSchema).min(1).max(200).describe(stepsDescription),
		connections: z
			.array(connectionSchema)
			.max(400)
			.default([])
			.describe("How the steps link together, by step key"),
	}),
	output: z.object({ automation: automationSchema }),
	async run(args, api) {
		const automation = await api.automations.create({
			name: args.name,
			description: args.description,
			status: "draft",
			steps: args.steps,
			connections: args.connections,
		});
		return { automation: toAutomationOutput(automation) };
	},
});
