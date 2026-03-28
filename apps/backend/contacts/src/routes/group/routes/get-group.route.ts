import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { getGroupHandler } from "@be/contacts/routes/group/controllers/get-group";
import { Elysia, t } from "elysia";

export const getGroupRoute = new Elysia().use(authMiddleware).get(
	"/:group_id",
	async ({ params, activeOrganizationId, logger }) => {
		return await getGroupHandler(activeOrganizationId, params.group_id, logger);
	},
	{
		auth: true,
		params: t.Object({ group_id: t.String() }),
		response: {
			200: GroupModel.groupResponse,
			404: GroupModel.groupNotFound,
			403: GroupModel.unauthorized,
		},
		detail: {
			tags: ["Groups"],
			summary: "Retrieve Group",
			description: "Returns group details based on group id",
		},
	},
);
