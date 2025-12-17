import { PropertyModel } from "@be/contacts/model/property.model";
import { deletePropertyHandler } from "@be/contacts/routes/property/controllers/delete-property";
import { Elysia, t } from "elysia";

export const deletePropertyRoute = new Elysia().delete(
  "/:propertyId",
  async ({ params, store }) => {
    const organizationId = (store as { organizationId: string }).organizationId;
    return deletePropertyHandler(organizationId, params.propertyId);
  },
  {
    params: t.Object({
      propertyId: t.String({ description: "Property ID to delete" }),
    }),
    response: {
      200: PropertyModel.deleteResponse,
      404: PropertyModel.propertyNotFound,
      401: PropertyModel.unauthorized,
    },
    detail: {
      tags: ["Properties"],
      summary: "Delete a property",
      description: "Soft delete a property by ID",
    },
  },
);
