import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { updateGroupController } from "@be/contacts/routes/group/update-group/update-group.controllers";
import { Elysia, t } from "elysia";
import { updateGroupXCodeSamples } from "./update-group.x-codeSamples";

export const updateGroupRoute = new Elysia().use(authMiddleware).patch(
  "/:group_id",
  async ({ params, body, activeOrganizationId, logger }) => {
    return await updateGroupController({
      activeOrganizationId,
      group_id: params.group_id,
      body,
      logger,
    });
  },
  {
    auth: true,
    params: t.Object({
      group_id: t.String(),
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
      summary: "Update Group",
      description: "Updates group name based on group id",
      "x-codeSamples": updateGroupXCodeSamples,
    },
  },
);
