import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { addContactToGroupController } from "./add-contact-to-group.controllers";
import { addContactToGroupXCodeSamples } from "./add-contact-to-group.x-codeSamples";

export const addContactToGroupRoute = new Elysia().use(authMiddleware).post(
  "/group/:group_id",
  async ({ body, params, activeOrganizationId, userId, logger }) => {
    return await addContactToGroupController({
      organizationId: activeOrganizationId,
      userId,
      groupId: params.group_id,
      body,
      logger,
    });
  },
  {
    auth: true,
    params: t.Object({ group_id: t.String() }),
    body: ContactModel.addContactToGroupBody,
    response: {
      200: ContactModel.addContactToGroupResponse,
      400: t.Object({ message: t.String() }),
      404: t.Object({ message: t.String() }),
    },
    detail: {
      tags: ["Contact"],
      summary: "Add Contact Group",
      description: "Adds a contact to a group by ID or email",
      "x-codeSamples": addContactToGroupXCodeSamples,
    },
  },
);
