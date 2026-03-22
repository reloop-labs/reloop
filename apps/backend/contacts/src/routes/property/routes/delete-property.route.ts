import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { deletePropertyHandler } from "@be/contacts/routes/property/controllers/delete-property";
import { Elysia, t } from "elysia";

export const deletePropertyRoute = new Elysia().use(authMiddleware).delete(
  "/:propertyId",
  async ({ params, activeOrganizationId }) => {
    return deletePropertyHandler(activeOrganizationId as string, params.propertyId);
  },
  {
    auth: true,
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
