import { PropertyModel } from "@be/contacts/model/property.model";
import { createPropertyHandler } from "@be/contacts/routes/property/controllers/create-property";
import { Elysia } from "elysia";

export const createPropertyRoute = new Elysia().post(
  "/create",
  async ({ body, store }) => {
    const organizationId = (store as { organizationId: string }).organizationId;
    return createPropertyHandler(organizationId, body);
  },
  {
    body: PropertyModel.createPropertyBody,
    response: {
      200: PropertyModel.propertyResponse,
      409: PropertyModel.propertyAlreadyExists,
      401: PropertyModel.unauthorized,
    },
    detail: {
      tags: ["Properties"],
      summary: "Create a new property",
      description: "Create a new custom property for contacts in the organization",
    },
  },
);
