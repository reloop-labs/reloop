import * as z from "zod";
import { defineTool } from "../define";
import {
	automationIdSchema,
	contactTargetMessage,
	contactTargetShape,
	enrollmentSchema,
	hasContactTarget,
	toEnrollmentOutput,
} from "./schemas";

export const enrollContact = defineTool({
	name: "enroll_contact",
	title: "Enroll contact in automation",
	description:
		"Start an active automation for one contact without tracking its event, for example to backfill an existing user. Its first emails can go out right away, so confirm with the user first. A contact is enrolled in each automation once: fails with `already_enrolled` when they already went through it, and with `cannot_enroll` when the automation is not active or the contact is unsubscribed.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: true,
	},
	input: z
		.object({ automationId: automationIdSchema, ...contactTargetShape })
		.refine(hasContactTarget, { message: contactTargetMessage }),
	output: z.object({
		enrollment: enrollmentSchema,
		contactCreated: z
			.boolean()
			.describe("True when email matched no contact and one was created"),
		firstStepInSeconds: z
			.number()
			.describe("Seconds until the first step runs"),
	}),
	async run(args, api) {
		const response = await api.automations.enroll(args.automationId, {
			contactId: args.contactId,
			email: args.email,
			firstName: args.firstName,
			lastName: args.lastName,
		});
		return {
			enrollment: toEnrollmentOutput(response.enrollment),
			contactCreated: response.contactCreated,
			firstStepInSeconds: Math.round(response.delayMs / 1000),
		};
	},
});
