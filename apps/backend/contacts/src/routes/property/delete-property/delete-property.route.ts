import { deletePropertySamples } from "@be/contacts/code-samples/property/delete-property";
import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { Elysia, t } from "elysia";
import { deletePropertyController } from "./delete-property.controllers";

export const deletePropertyRoute = new Elysia().use(authMiddleware).delete(
  "/:contact_property_id",
  async ({ params, activeOrganizationId, logger }) => {
    return deletePropertyController({
      activeOrganizationId: activeOrganizationId as string,
      property_id: params.contact_property_id,
      logger,
    });
  },
  {
    auth: true,
    params: t.Object({ contact_property_id: t.String({ description: "Property ID to delete" }) }),
    response: {
      200: PropertyModel.deleteResponse,
      404: PropertyModel.propertyNotFound,
      401: PropertyModel.unauthorized,
    },
    detail: {
      tags: ["Contact Properties"],
      summary: "Delete Contact Property",
      description: "Soft delete a property by ID",
      "x-codeSamples": deletePropertySamples,
      responses: {
        200: {
          description: "Property deleted successfully",
          content: {
            "application/json": {
              example: { success: true },
            },
          },
        },
      },
    },
  },
);
