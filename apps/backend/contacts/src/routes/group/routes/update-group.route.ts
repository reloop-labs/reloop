import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { updateGroupHandler } from "@be/contacts/routes/group/controllers/update-group";
import { Elysia, t } from "elysia";

export const updateGroupRoute = new Elysia().use(authMiddleware).patch(
  "/:groupId",
  async ({ params, body, activeOrganizationId, logger }) => {
    const { groupId } = params;
    const { name } = body;
    return await updateGroupHandler(
      {
        organizationId: activeOrganizationId as string,
        groupId,
        name,
      },
      logger,
    );
  },
  {
    auth: true,
    params: t.Object({
      groupId: t.String(),
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
      summary: "Update group",
      description: "Updates an existing group for the organization",
    },
  },
);
