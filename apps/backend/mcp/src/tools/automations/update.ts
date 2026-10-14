import * as z from "zod";
import { defineTool } from "../define";
import {
	automationIdSchema,
	automationSchema,
	connectionSchema,
	stepSchema,
	stepsDescription,
	toAutomationOutput,
} from "./schemas";

export const updateAutomation = defineTool({
	name: "update_automation",
	title: "Update automation",
	description:
		"Rename an automation, change its description, or replace its steps and connections. `steps` replaces every step, so read the current ones with get_automation and pass the full updated list with its connections. Changing the steps of an active automation saves them as a draft: call activate_automation afterwards to publish them. To start or stop it, use activate_automation or pause_automation.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({
			id: automationIdSchema,
			name: z.string().trim().min(1).max(255).optional(),
			description: z
				.string()
				.max(2000)
				.nullable()
				.optional()
				.describe("New description, or null to clear it"),
			steps: z
				.array(stepSchema)
				.min(1)
				.max(200)
				.optional()
				.describe(`${stepsDescription} Replaces every step.`),
			connections: z
				.array(connectionSchema)
				.max(400)
				.optional()
				.describe("Replaces every connection; pass it together with steps"),
		})
		.refine(
			(value) =>
				value.name !== undefined ||
				value.description !== undefined ||
				value.steps !== undefined,
			{ message: "Pass at least one of name, description or steps" },
		)
		.refine(
			(value) => value.connections === undefined || value.steps !== undefined,
			{
				message: "connections replace the flow together with steps; pass both",
			},
		),
	output: z.object({ automation: automationSchema }),
	async run(args, api) {
		const automation = await api.automations.update(args.id, {
			name: args.name,
			description: args.description,
			steps: args.steps,
			connections:
				args.steps === undefined ? undefined : (args.connections ?? []),
		});
		return { automation: toAutomationOutput(automation) };
	},
});
