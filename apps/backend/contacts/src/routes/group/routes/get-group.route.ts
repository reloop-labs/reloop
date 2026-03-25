import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { getGroupHandler } from "@be/contacts/routes/group/controllers/get-group";
import { Elysia, t } from "elysia";

export const getGroupRoute = new Elysia().use(authMiddleware).get(
  "/:contact_group_id",
  async ({ params, activeOrganizationId, logger }) => {
    const { contact_group_id } = params;
    return await getGroupHandler(
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
      200: GroupModel.groupResponse,
      404: GroupModel.groupNotFound,
      403: GroupModel.unauthorized,
    },
    detail: {
      tags: ["Contact groups"],
      summary: "Get contact group",
      description: "Returns a single group for the organization",
    },
  },
);
