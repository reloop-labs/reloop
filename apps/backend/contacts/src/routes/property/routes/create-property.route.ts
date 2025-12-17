import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { createPropertyHandler } from "@be/contacts/routes/property/controllers/create-property";
import type { User } from "@reloop/auth/server";
import { Elysia } from "elysia";

export const createPropertyRoute = new Elysia().use(authMiddleware).post(
  "/create",
  async ({ body, user }: { body: PropertyModel.CreatePropertyBody; user: User }) => {
    const { activeOrganizationId } = user;
    return createPropertyHandler(activeOrganizationId as string, user.id, body);
  },
  {
    auth: true,
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

