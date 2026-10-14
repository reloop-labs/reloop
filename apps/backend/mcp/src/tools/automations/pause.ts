import * as z from "zod";
import { defineTool } from "../define";
import {
	automationIdSchema,
	automationSchema,
	toAutomationOutput,
} from "./schemas";

export const pauseAutomation = defineTool({
	name: "pause_automation",
	title: "Pause automation",
	description:
		"Stop an automation from starting for new events. Contacts already in it are cancelled when their next step comes due, and activating it again does not resume them. Confirm with the user first when list_enrollments shows active enrollments.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: automationIdSchema }),
	output: z.object({ automation: automationSchema }),
	async run(args, api) {
		return {
			automation: toAutomationOutput(await api.automations.pause(args.id)),
		};
	},
});
