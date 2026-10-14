import * as z from "zod";
import { defineTool } from "../define";
import {
	automationIdSchema,
	automationSchema,
	toAutomationOutput,
} from "./schemas";

export const activateAutomation = defineTool({
	name: "activate_automation",
	title: "Activate automation",
	description:
		"Publish an automation's current steps and start running it: from now on, every time its trigger event is tracked for a contact, that contact gets its emails. This makes the automation send real email; confirm with the user first. Also call this after editing an active automation to publish the changes. Contacts already enrolled finish on the version they started with. Fails with `invalid_automation` when the steps are incomplete or the trigger event does not exist.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: true,
	},
	input: z.object({ id: automationIdSchema }),
	output: z.object({ automation: automationSchema }),
	async run(args, api) {
		return {
			automation: toAutomationOutput(await api.automations.activate(args.id)),
		};
	},
});
