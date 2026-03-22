import { authMiddleware } from "@be/contacts/middleware/auth";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { Elysia, t } from "elysia";

export const getContactPropertiesRoute = new Elysia()
  .use(authMiddleware)
  .get(
    "/:id/properties",
    async ({
      params,
      activeOrganizationId,
    }) => {

      // First verify the contact belongs to this organization
      const contact = await db.query.contact.findFirst({
        where: and(
          eq(schema.contact.id, params.id),
          eq(schema.contact.organizationId, activeOrganizationId as string),
          isNull(schema.contact.deletedAt),
        ),
      });

      if (!contact) {
        return { propertyValues: [] };
      }

      // Get all property values for this contact
      const propertyValues = await db.query.contactPropertyValue.findMany({
        where: eq(schema.contactPropertyValue.contactId, params.id),
      });

      return {
        propertyValues: propertyValues.map((pv) => ({
          id: pv.id,
          propertyId: pv.propertyId,
          value: pv.value,
          createdAt: pv.createdAt,
          updatedAt: pv.updatedAt,
        })),
      };
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          propertyValues: t.Array(
            t.Object({
              id: t.String(),
              propertyId: t.String(),
              value: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            }),
          ),
        }),
      },
      detail: {
        tags: ["Contact"],
        summary: "Get contact property values",
        description: "Gets all property values for a specific contact",
      },
    },
  );
