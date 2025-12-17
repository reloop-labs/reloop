import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { listPropertiesHandler } from "@be/contacts/routes/property/controllers/list-properties";
import type { User } from "@reloop/auth/server";
import { Elysia } from "elysia";

export const listPropertiesRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, user }: { query: PropertyModel.PropertyQuery; user: User }) => {
    const { activeOrganizationId } = user;
    return listPropertiesHandler(activeOrganizationId as string, query);
  },
  {
    auth: true,
    query: PropertyModel.propertyQuery,
    response: {
      200: PropertyModel.propertyListResponse,
      401: PropertyModel.unauthorized,
    },
    detail: {
      tags: ["Properties"],
      summary: "List properties",
      description: "List all properties for the organization with pagination and filtering",
    },
  },
);
