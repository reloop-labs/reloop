import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { createPropertyHandler } from "@be/contacts/routes/property/controllers/create-property";
import { Elysia } from "elysia";

export const createPropertyRoute = new Elysia().use(authMiddleware).post(
  "/create",
  async ({ body, activeOrganizationId, userId, logger }) => {
    return createPropertyHandler(activeOrganizationId as string, userId, body, logger);
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
      tags: ["Contact Properties"],
      summary: "Create Contact property",
      description: "Create a new custom property for contacts in the organization",
      responses: {
        200: {
          description: "Property created successfully",
          content: {
            "application/json": {
              example: {
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
            },
          },
        },
      },
    },
  },
);

