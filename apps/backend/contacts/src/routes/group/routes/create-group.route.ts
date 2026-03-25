import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { createGroupHandler } from "@be/contacts/routes/group/controllers/create-group";
import { Elysia } from "elysia";

export const createGroupRoute = new Elysia().use(authMiddleware).post(
  "/create",
  async ({ body, activeOrganizationId, userId, logger }) => {
    const { name } = body;
    return await createGroupHandler(
      {
        organizationId: activeOrganizationId as string,
        userId,
        name,
      },
      logger,
    );
  },
  {
    auth: true,
    body: GroupModel.createGroupBody,
    response: {
      201: GroupModel.groupResponse,
      409: GroupModel.groupAlreadyExists,
      403: GroupModel.unauthorized,
    },
    detail: {
      tags: ["Groups"],
      summary: "Create group",
      description: "Creates a new group for the organization",
    },
  },
);
