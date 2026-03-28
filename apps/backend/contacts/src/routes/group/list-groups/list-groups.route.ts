import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { listGroupsController } from "@be/contacts/routes/group/list-groups/list-groups.controllers";
import { Elysia } from "elysia";
import { listGroupsXCodeSamples } from "./list-groups.x-codeSamples";

export const listGroupsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, activeOrganizationId, logger }) => {
    const { page, limit, search } = query;
    return await listGroupsController({
      organizationId: activeOrganizationId as string,
      page,
      limit,
      search,
      logger,
    });
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
      "x-codeSamples": listGroupsXCodeSamples,
    },
  },
);
