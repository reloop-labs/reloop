import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { getContactController } from "./get-contact.controllers";
import { getContactXCodeSamples } from "./get-contact.x-codeSamples";

export const getContactRoute = new Elysia().use(authMiddleware).get(
  "/retrieve/:contact_id",
  async ({ params, activeOrganizationId, logger }) => {
    return await getContactController({
      contactId: params.contact_id,
      organizationId: activeOrganizationId,
      logger,
    });
  },
  {
    auth: true,
    params: t.Object({ contact_id: t.String() }),
    response: {
      200: ContactModel.contactResponse,
      404: ContactModel.contactNotFound,
      403: ContactModel.unauthorized,
    },
    detail: {
      tags: ["Contact"],
      summary: "Retrieve Contact",
      description: "Retrieves a contact by ID",
      "x-codeSamples": getContactXCodeSamples,
    },
  },
);
