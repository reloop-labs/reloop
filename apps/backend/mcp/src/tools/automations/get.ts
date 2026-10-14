import * as z from "zod";
import { defineTool } from "../define";
import {
	automationIdSchema,
	automationSchema,
	toAutomationOutput,
} from "./schemas";

export const getAutomation = defineTool({
	name: "get_automation",
	title: "Get automation",
	description:
		"Get one automation by ID with its status, trigger event, steps and connections. Steps are trigger, send_email (a template), delay and condition (a yes/no branch).",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: automationIdSchema }),
	output: z.object({ automation: automationSchema }),
	async run(args, api) {
		return {
			automation: toAutomationOutput(await api.automations.retrieve(args.id)),
		};
	},
});
