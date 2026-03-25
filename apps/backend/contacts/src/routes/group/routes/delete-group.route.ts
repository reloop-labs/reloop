import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { deleteGroupHandler } from "@be/contacts/routes/group/controllers/delete-group";
import { Elysia, t } from "elysia";

export const deleteGroupRoute = new Elysia().use(authMiddleware).delete(
  "/:groupId",
  async ({ params, activeOrganizationId, logger }) => {
    const { groupId } = params;
    return await deleteGroupHandler(
      {
        organizationId: activeOrganizationId as string,
        groupId,
      },
      logger,
    );
  },
  {
    auth: true,
    params: t.Object({
      groupId: t.String(),
    }),
    response: {
      200: GroupModel.deleteResponse,
      404: GroupModel.groupNotFound,
      403: GroupModel.unauthorized,
    },
    detail: {
      tags: ["Groups"],
      summary: "Delete group",
      description: "Deletes a group for the organization",
    },
  },
);
