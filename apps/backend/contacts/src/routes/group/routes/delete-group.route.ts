import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { deleteGroupHandler } from "@be/contacts/routes/group/controllers/delete-group";
import { Elysia, t } from "elysia";

export const deleteGroupRoute = new Elysia().use(authMiddleware).delete(
	"/:contact_group_id",
	async ({ params, activeOrganizationId, logger }) => {
		const { contact_group_id } = params;
		return await deleteGroupHandler(
			{
				organizationId: activeOrganizationId as string,
				contact_group_id,
			},
			logger,
		);
	},
	{
		auth: true,
		params: t.Object({
			contact_group_id: t.String(),
		}),
		response: {
			200: GroupModel.deleteResponse,
			404: GroupModel.groupNotFound,
			403: GroupModel.unauthorized,
		},
		detail: {
			tags: ["Groups"],
			summary: "Delete Group",
			description: "Deletes a group for the organization",
		},
	},
);
