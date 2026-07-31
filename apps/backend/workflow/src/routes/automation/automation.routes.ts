import { activateAutomationRoute } from "@be/workflow/routes/automation/activate-automation/activate-automation.route";
import { createAutomationRoute } from "@be/workflow/routes/automation/create-automation/create-automation.route";
import { deleteAutomationRoute } from "@be/workflow/routes/automation/delete-automation/delete-automation.route";
import { getAutomationRoute } from "@be/workflow/routes/automation/get-automation/get-automation.route";
import { listAutomationsRoute } from "@be/workflow/routes/automation/list-automations/list-automations.route";
import { pauseAutomationRoute } from "@be/workflow/routes/automation/pause-automation/pause-automation.route";
import { updateAutomationRoute } from "@be/workflow/routes/automation/update-automation/update-automation.route";
import { Elysia } from "elysia";

export const automationRoutes = new Elysia({
	prefix: "/v1/automations",
	name: "AutomationRoutes",
})
	.use(createAutomationRoute)
	.use(listAutomationsRoute)
	.use(activateAutomationRoute)
	.use(pauseAutomationRoute)
	.use(getAutomationRoute)
	.use(updateAutomationRoute)
	.use(deleteAutomationRoute);
