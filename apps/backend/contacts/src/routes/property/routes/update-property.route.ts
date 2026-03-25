import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { updatePropertyHandler } from "@be/contacts/routes/property/controllers/update-property";
import { Elysia, t } from "elysia";

export const updatePropertyRoute = new Elysia().use(authMiddleware).patch(
  "/:contact_property_id",
  async ({ params, body, activeOrganizationId, logger }) => {
    return updatePropertyHandler(activeOrganizationId as string, params.contact_property_id, body, logger);
  },
  {
    auth: true,
    params: t.Object({
      contact_property_id: t.String({ description: "Property ID to update" }),
    }),
    body: t.Object({
      fallbackValue: t.Nullable(t.String({ description: "New fallback value" })),
    }),
    response: {
      200: PropertyModel.propertyResponse,
      404: PropertyModel.propertyNotFound,
      401: PropertyModel.unauthorized,
    },
    detail: {
      tags: ["Contact Properties"],
      summary: "Update A Contact Property",
      description: "Update the fallback value of a property",
      responses: {
        200: {
          description: "Property updated successfully",
          content: {
            "application/json": {
              example: {
                object: "contact_property",
                id: "prop_123456789",
                name: "company_name",
                type: "string",
                fallbackValue: "New Company",
                organizationId: "org_123456789",
                createdAt: "2026-03-24T10:00:00Z",
                updatedAt: "2026-03-24T11:00:00Z",
                deletedAt: null,
              },
            },
          },
        },
      },
    },
  },
);
