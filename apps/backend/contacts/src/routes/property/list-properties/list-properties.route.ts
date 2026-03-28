import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { Elysia } from "elysia";
import { listPropertiesController } from "./list-properties.controllers";
import { listPropertiesXCodeSamples } from "./list-properties.x-codeSamples";

export const listPropertiesRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, activeOrganizationId, logger }) => {
    return listPropertiesController({
      activeOrganizationId: activeOrganizationId as string,
      query,
      logger,
    });
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
      summary: "List Contact Properties",
      description:
        "List all properties for the organization with pagination and filtering",
      "x-codeSamples": listPropertiesXCodeSamples,
      responses: {
        200: {
          description: "Properties listed successfully",
          content: {
            "application/json": {
              example: {
                object: "contact_property",
                properties: [
                  {
                    object: "contact_property",
                    id: "prop_123456789",
                    name: "company_name",
                    type: "string",
                    fallbackValue: "Unknown",
                    organizationId: "org_123456789",
                    createdAt: "2026-03-24T10:00:00Z",
                    updatedAt: "2026-03-24T10:00:00Z",
                    deletedAt: null,
                  },
                ],
                total: 1,
                page: 1,
                limit: 100,
              },
            },
          },
        },
      },
    },
  },
);
