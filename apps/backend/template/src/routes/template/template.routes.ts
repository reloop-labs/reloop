import { authMiddleware } from "@be/template/middleware/auth";
import { createTemplateRoute } from "@be/template/routes/template/create-template/create-template.route";
import { deleteTemplateRoute } from "@be/template/routes/template/delete-template/delete-template.route";
import { duplicateTemplateRoute } from "@be/template/routes/template/duplicate-template/duplicate-template.route";
import { getTemplateRoute } from "@be/template/routes/template/get-template/get-template.route";
import { listTemplatesRoute } from "@be/template/routes/template/list-templates/list-templates.route";
import { updateTemplateRoute } from "@be/template/routes/template/update-template/update-template.route";
import { createVersionRoute } from "@be/template/routes/template/version/create-version.route";
import { deleteVersionRoute } from "@be/template/routes/template/version/delete-version.route";
import { listVersionsRoute } from "@be/template/routes/template/version/list-versions.route";
import { restoreVersionRoute } from "@be/template/routes/template/version/restore-version.route";
import { Elysia } from "elysia";

export const templateRoutes = new Elysia({
	prefix: "/v1",
	name: "TemplateRoutes",
})
	.use(authMiddleware)
	.use(createTemplateRoute)
	.use(createVersionRoute)
	.use(listVersionsRoute)
	.use(deleteVersionRoute)
	.use(restoreVersionRoute)
	.use(getTemplateRoute)
	.use(listTemplatesRoute)
	.use(updateTemplateRoute)
	.use(deleteTemplateRoute)
	.use(duplicateTemplateRoute);
