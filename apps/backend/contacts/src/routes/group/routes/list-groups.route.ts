import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { listGroupsHandler } from "@be/contacts/routes/group/controllers/list-groups";
import { Elysia } from "elysia";

export const listGroupsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, activeOrganizationId, logger }) => {
    const { page, limit, search } = query;
    return await listGroupsHandler(
      {
        organizationId: activeOrganizationId as string,
        page,
        limit,
        search,
      },
      logger,
    );
  },
  {
    auth: true,
    query: GroupModel.groupQuery,
    response: {
      200: GroupModel.groupListResponse,
      403: GroupModel.unauthorized,
    },
    detail: {
      tags: ["Groups"],
      summary: "List Groups",
      description: "List all groups for the organization",
    },
  },
);
