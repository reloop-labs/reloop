import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { deletePropertyHandler } from "@be/contacts/routes/property/controllers/delete-property";
import { Elysia, t } from "elysia";

export const deletePropertyRoute = new Elysia().use(authMiddleware).delete(
  "/:contact_property_id",
  async ({ params, activeOrganizationId, logger }) => {
    return deletePropertyHandler(activeOrganizationId as string, params.contact_property_id, logger);
  },
  {
    auth: true,
    params: t.Object({
      contact_property_id: t.String({ description: "Property ID to delete" }),
    }),
    response: {
      200: PropertyModel.deleteResponse,
      404: PropertyModel.propertyNotFound,
      401: PropertyModel.unauthorized,
    },
    detail: {
      tags: ["Contact Properties"],
      summary: "Delete Contact Property",
      description: "Soft delete a property by ID",
      responses: {
        200: {
          description: "Property deleted successfully",
          content: {
            "application/json": {
              example: {
                success: true,
              },
            },
          },
        },
      },
    },
  },
);
