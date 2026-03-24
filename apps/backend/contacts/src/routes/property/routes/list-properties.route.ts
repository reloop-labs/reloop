import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { listPropertiesHandler } from "@be/contacts/routes/property/controllers/list-properties";
import { Elysia } from "elysia";

export const listPropertiesRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, activeOrganizationId, logger }) => {
    return listPropertiesHandler(activeOrganizationId as string, query, logger);
  },
  {
    auth: true,
    query: PropertyModel.propertyQuery,
    response: {
      200: PropertyModel.propertyListResponse,
      401: PropertyModel.unauthorized,
    },
    detail: {
      tags: ["Contact Properties"],
      summary: "List Contact properties",
      description: "List all properties for the organization with pagination and filtering",
    },
  },
);
