import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { Elysia, t } from "elysia";
import { enrollContactController } from "./enroll-contact.controllers";

export const enrollContactRoute = new Elysia().use(authMiddleware).post(
	"/:automation_id/enroll",
	async ({ params: { automation_id }, body, organizationId, userId }) => {
		return await enrollContactController({
			organizationId,
			userId,
			automationId: automation_id,
			contactId: body.contactId,
			email: body.email,
			firstName: body.firstName,
			lastName: body.lastName,
		});
	},
	{
		auth: true,
		params: t.Object({
			automation_id: AutomationModel.automationIdParam,
		}),
		body: AutomationModel.enrollBody,
		response: {
			200: AutomationModel.enrollResponse,
			400: AutomationModel.evlogError,
			401: AutomationModel.evlogError,
			404: AutomationModel.evlogError,
			409: AutomationModel.evlogError,
			500: AutomationModel.evlogError,
		},
		detail: {
			tags: ["Automations"],
			summary: "Enroll a contact",
			description:
				"Starts this active automation for a contact. Pass contactId or email (email creates the contact if needed).",
		},
	},
);
