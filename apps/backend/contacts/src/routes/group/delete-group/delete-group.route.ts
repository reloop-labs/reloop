import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { GroupModel } from "@be/contacts/model/group.model";
import { deleteGroupController } from "@be/contacts/routes/group/delete-group/delete-group.controllers";
import { Elysia, t } from "elysia";
import { deleteGroupXCodeSamples } from "./delete-group.x-codeSamples";

export const deleteGroupRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "delete-group" }),
	)
	.delete(
		"/:group_id",
		async ({ params, organizationId }) => {
			return await deleteGroupController({
				organizationId,
				group_id: params.group_id,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({ group_id: t.String() }),
			response: {
				200: GroupModel.deleteResponse,
				404: GroupModel.groupNotFound,
				403: GroupModel.unauthorized,
			},
			detail: {
				tags: ["Groups"],
				summary: "Delete Group",
				description: "Delete group based on group id",
				"x-codeSamples": deleteGroupXCodeSamples,
			},
		},
	);
