import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { getGroupController } from "@be/contacts/routes/group/get-group/get-group.controllers";
import { Elysia, t } from "elysia";
import { getGroupXCodeSamples } from "./get-group.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const getGroupRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 60, windowSeconds: 60, namespace: "get-group" }))
	.get(
	"/:group_id",
	async ({ params, activeOrganizationId, logger }) => {
		return await getGroupController({
			activeOrganizationId,
			group_id: params.group_id,
		});
	},
	{
		auth: true,
		rateLimit: true,
		params: t.Object({ group_id: t.String() }),
		response: {
			200: GroupModel.groupBaseResponse,
			404: GroupModel.groupNotFound,
			403: GroupModel.unauthorized,
		},
		detail: {
			tags: ["Groups"],
			summary: "Retrieve Group",
			description: "Returns group details based on group id",
			"x-codeSamples": getGroupXCodeSamples,
		},
	},
);
