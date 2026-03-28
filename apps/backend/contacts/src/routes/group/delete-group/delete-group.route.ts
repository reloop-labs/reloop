import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { deleteGroupController } from "@be/contacts/routes/group/delete-group/delete-group.controllers";
import { Elysia, t } from "elysia";
import { deleteGroupXCodeSamples } from "./delete-group.x-codeSamples";

export const deleteGroupRoute = new Elysia().use(authMiddleware).delete(
  "/:group_id",
  async ({ params, activeOrganizationId, logger }) => {
    return await deleteGroupController(
      activeOrganizationId,
      params.group_id,
      logger,
    );
  },
  {
    auth: true,
    params: t.Object({
      group_id: t.String(),
    }),
    response: {
      200: GroupModel.deleteResponse,
      404: GroupModel.groupNotFound,
      403: GroupModel.unauthorized,
    },
    detail: {
      tags: ["Groups"],
      summary: "Delete Group",
      description: "Delete group based on group id",
      "x-codeSamples": deleteGroupXCodeSamples,
    },
  },
);
