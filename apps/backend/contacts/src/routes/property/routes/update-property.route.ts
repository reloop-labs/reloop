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
      summary: "Update a Contact property",
      description: "Update the fallback value of a property",
    },
  },
);
