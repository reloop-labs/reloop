import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { getGroupHandler } from "@be/contacts/routes/group/controllers/get-group";
import { Elysia, t } from "elysia";

export const getGroupRoute = new Elysia().use(authMiddleware).get(
  "/:groupId",
  async ({ params, activeOrganizationId, logger }) => {
    const { groupId } = params;
    return await getGroupHandler(
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
      200: GroupModel.groupResponse,
      404: GroupModel.groupNotFound,
      403: GroupModel.unauthorized,
    },
    detail: {
      tags: ["Groups"],
      summary: "Get group",
      description: "Returns a single group for the organization",
    },
  },
);
