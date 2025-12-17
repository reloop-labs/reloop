import { PropertyModel } from "@be/contacts/model/property.model";
import { listPropertiesHandler } from "@be/contacts/routes/property/controllers/list-properties";
import { Elysia } from "elysia";

export const listPropertiesRoute = new Elysia().get(
  "/list",
  async ({ query, store }) => {
    const organizationId = (store as { organizationId: string }).organizationId;
    return listPropertiesHandler(organizationId, query);
  },
  {
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
