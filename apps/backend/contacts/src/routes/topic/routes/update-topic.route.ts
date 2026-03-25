import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { updateTopicHandler } from "@be/contacts/routes/topic/controllers/update-topic";
import { Elysia, t } from "elysia";

export const updateTopicRoute = new Elysia().use(authMiddleware).patch(
  "/:topic_id",
  async ({ params, body, activeOrganizationId, logger }) => {
    const { name, description, defaultSubscription, visibility } = body;
    return await updateTopicHandler(
      {
        contactTopicId: params.topic_id,
        organizationId: activeOrganizationId as string,
        name,
        description: description ?? undefined,
        defaultSubscription,
        visibility,
      },
      logger,
    );
  },
  {
    auth: true,
    params: t.Object({
      topic_id: t.String({ description: "Topic ID" }),
    }),
    body: TopicModel.updateTopicBody,
    response: {
      200: TopicModel.topicResponse,
      404: TopicModel.topicNotFound,
      409: TopicModel.topicAlreadyExists,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Update Topic",
      description: "Updates an existing topic",
      responses: {
        200: {
          description: "Topic updated successfully",
          content: {
            "application/json": {
              example: {
                object: "topic",
                id: "topic_123456789",
                name: "Updated Newsletter",
                description: "Monthly newsletter subscribers",
                defaultSubscription: "opt_in",
                visibility: "public",
                organizationId: "org_123456789",
                createdAt: "2026-03-24T10:00:00Z",
                updatedAt: "2026-03-24T11:00:00Z",
                deletedAt: null,
              },
            },
          },
        },
      },
    },
  },
);
