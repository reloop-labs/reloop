import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { updatePropertyHandler } from "@be/contacts/routes/property/controllers/update-property";
import { Elysia, t } from "elysia";

export const updatePropertyRoute = new Elysia().use(authMiddleware).patch(
  "/:propertyId",
  async ({ params, body, activeOrganizationId }) => {
    return updatePropertyHandler(activeOrganizationId as string, params.propertyId, body);
  },
  {
    auth: true,
    params: t.Object({
      propertyId: t.String({ description: "Property ID to update" }),
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
      tags: ["Properties"],
      summary: "Update a property",
      description: "Update the fallback value of a property",
    },
  },
);
