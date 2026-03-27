import { updateGroupSamples } from "@be/contacts/code-samples/group/update-group";
import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { updateGroupHandler } from "@be/contacts/routes/group/controllers/update-group";
import { Elysia, t } from "elysia";

export const updateGroupRoute = new Elysia().use(authMiddleware).patch(
	"/:group_id",
	async ({ params, body, activeOrganizationId, logger }) => {
		return await updateGroupHandler(
			activeOrganizationId,
			params.group_id,
			body,
			logger,
		);
	},
	{
		auth: true,
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
			description: "Updates an existing group for the organization",
			"x-codeSamples": updateGroupSamples,
		},
	},
);
