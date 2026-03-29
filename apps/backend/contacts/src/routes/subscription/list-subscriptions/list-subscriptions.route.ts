import { authMiddleware } from "@be/contacts/middleware/auth";
import { Elysia, t } from "elysia";
import { listSubscriptionsController } from "./list-subscriptions.controllers";

export const listSubscriptionsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, activeOrganizationId, logger }) => {
    return await listSubscriptionsController({
      organizationId: activeOrganizationId as string,
      query: {
        topicId: query.topicId,
        limit: query.limit as number | undefined,
        page: query.page as number | undefined,
      },
      logger,
    });
  },
  {
    auth: true,
    query: t.Object({
      topicId: t.String({ description: "ID of the topic to list enrollments for" }),
      limit: t.Optional(t.Numeric({ default: 100 })),
      page: t.Optional(t.Numeric({ default: 1 })),
    }),
    detail: {
      tags: ["Subscription"],
      summary: "List topic subscriptions",
      description: "Lists all contacts subscribed/enrolled to a specific topic",
    },
  }
);
