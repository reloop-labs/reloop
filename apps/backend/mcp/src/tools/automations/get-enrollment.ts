import * as z from "zod";
import { defineTool } from "../define";
import {
	automationIdSchema,
	enrollmentIdSchema,
	enrollmentSchema,
	stepRunSchema,
	toEnrollmentOutput,
	toStepRunOutput,
} from "./schemas";

export const getEnrollment = defineTool({
	name: "get_enrollment",
	title: "Get enrollment",
	description:
		"Get one contact's run through an automation with what happened at each step: when it ran, whether it completed, was skipped or failed (with the reason in `error`), and the email a send_email step sent (look it up with get_email). Use this to explain why a contact did or did not get an email.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		automationId: automationIdSchema,
		enrollmentId: enrollmentIdSchema,
	}),
	output: z.object({
		enrollment: enrollmentSchema,
		steps: z.array(stepRunSchema),
	}),
	async run(args, api) {
		const response = await api.automations.retrieveEnrollment(
			args.automationId,
			args.enrollmentId,
		);
		return {
			enrollment: toEnrollmentOutput(response.enrollment),
			steps: response.steps.map(toStepRunOutput),
		};
	},
});
