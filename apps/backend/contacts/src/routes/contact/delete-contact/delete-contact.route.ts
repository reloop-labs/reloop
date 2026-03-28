import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { deleteContactController } from "./delete-contact.controllers";
import { deleteContactXCodeSamples } from "./delete-contact.x-codeSamples";

export const deleteContactRoute = new Elysia().use(authMiddleware).delete(
  "/:contact_id",
  async ({ params, activeOrganizationId }) => {
    return await deleteContactController({
      contactId: params.contact_id,
      organizationId: activeOrganizationId,
    });
  },
  {
    auth: true,
    params: t.Object({
      contact_id: t.String(),
    }),
    response: {
      200: ContactModel.deleteResponse,
      404: ContactModel.contactNotFound,
      403: ContactModel.unauthorized,
    },
    detail: {
      tags: ["Contact"],
      summary: "Delete Contact",
      description: "Removes a contact from the organization",
      "x-codeSamples": deleteContactXCodeSamples,
    },
  },
);
