import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { GroupModel } from "@be/contacts/model/group.model";
import { updateGroupController } from "@be/contacts/routes/group/update-group/update-group.controllers";
import { Elysia, t } from "elysia";
import { updateGroupXCodeSamples } from "./update-group.x-codeSamples";

export const updateGroupRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "update-group" }),
	)
	.patch(
		"/:group_id",
		async ({ params, body, activeOrganizationId }) => {
			return await updateGroupController({
				activeOrganizationId,
				group_id: params.group_id,
				name: body.name,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				group_id: t.String(),
			}),
			body: GroupModel.updateGroupBody,
			response: {
				200: GroupModel.groupResponse,
				404: GroupModel.groupNotFound,
				409: GroupModel.groupAlreadyExists,
				403: GroupModel.unauthorized,
			},
			detail: {
				tags: ["Groups"],
				summary: "Update Group",
				description: "Updates group name based on group id",
				"x-codeSamples": updateGroupXCodeSamples,
			},
		},
	);
