import { authMiddleware } from "@be/template/middleware/auth";
import { agentRoute } from "@be/template/routes/template/ai/agent/agent.route";
import { aiRoute } from "@be/template/routes/template/ai/ai.route";
import { createTemplateRoute } from "@be/template/routes/template/create-template/create-template.route";
import { createVersionRoute } from "@be/template/routes/template/create-version/create-version.route";
import { deleteTemplateRoute } from "@be/template/routes/template/delete-template/delete-template.route";
import { deleteVersionRoute } from "@be/template/routes/template/delete-version/delete-version.route";
import { duplicateTemplateRoute } from "@be/template/routes/template/duplicate-template/duplicate-template.route";
import { getTemplateRoute } from "@be/template/routes/template/get-template/get-template.route";
import { getThumbnailRoute } from "@be/template/routes/template/get-thumbnail/get-thumbnail.route";
import { htmlToImageRoute } from "@be/template/routes/template/html-to-image/html-to-image.route";
import { listTemplatesRoute } from "@be/template/routes/template/list-templates/list-templates.route";
import { listVersionsRoute } from "@be/template/routes/template/list-versions/list-versions.route";
import { restoreVersionRoute } from "@be/template/routes/template/restore-version/restore-version.route";
import { testTemplateRoute } from "@be/template/routes/template/test-template/test-template.route";
import { updateTemplateRoute } from "@be/template/routes/template/update-template/update-template.route";
import { Elysia } from "elysia";

export const templateRoutes = new Elysia({
	prefix: "/v1",
	name: "TemplateRoutes",
})
	.use(authMiddleware)
	.use(createTemplateRoute)
	.use(htmlToImageRoute)
	.use(createVersionRoute)
	.use(listVersionsRoute)
	.use(deleteVersionRoute)
	.use(restoreVersionRoute)
	.use(getThumbnailRoute)
	.use(getTemplateRoute)
	.use(listTemplatesRoute)
	.use(updateTemplateRoute)
	.use(deleteTemplateRoute)
	.use(duplicateTemplateRoute)
	.use(testTemplateRoute)
	.use(aiRoute)
	.use(agentRoute);
