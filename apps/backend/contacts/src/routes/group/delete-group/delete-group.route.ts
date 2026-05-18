import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { deleteGroupController } from "@be/contacts/routes/group/delete-group/delete-group.controllers";
import { Elysia, t } from "elysia";
import { deleteGroupXCodeSamples } from "./delete-group.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const deleteGroupRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "delete-group" }))
	.delete(
	"/:group_id",
	async ({ params, activeOrganizationId, logger, path, request, headers }) => {
		const cookieString = headers["cookie"] || "";
		return await deleteGroupController({
			activeOrganizationId,
			group_id: params.group_id,
			logger,
			cookie: cookieString,
			requestDetails: {
				endpoint: path,
				method: request.method,
				userAgent: headers["user-agent"],
				ipAddress:
					(headers["x-forwarded-for"] as string) ||
					(headers["x-real-ip"] as string),
			},
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
