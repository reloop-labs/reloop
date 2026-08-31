import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { Elysia, t } from "elysia";
import { getEnrollmentController } from "./get-enrollment.controllers";

export const getEnrollmentRoute = new Elysia().use(authMiddleware).get(
	"/:automation_id/enrollments/:enrollment_id",
	async ({ params: { automation_id, enrollment_id }, organizationId }) => {
		return await getEnrollmentController({
			organizationId,
			automationId: automation_id,
			enrollmentId: enrollment_id,
		});
	},
	{
		auth: true,
		params: t.Object({
			automation_id: AutomationModel.automationIdParam,
			enrollment_id: t.String({ minLength: 1 }),
		}),
		response: {
			200: AutomationModel.enrollmentDetailResponse,
			401: AutomationModel.evlogError,
			404: AutomationModel.evlogError,
		},
		detail: {
			tags: ["Automations"],
			summary: "Get enrollment",
			description: "Retrieves an enrollment and its step runs",
		},
	},
);
