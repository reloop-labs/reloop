import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { createTopicHandler } from "@be/contacts/routes/topic/controllers/create-topic";
import { Elysia } from "elysia";

export const createTopicRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, activeOrganizationId, userId, logger }) => {
		const { name, description, defaultSubscription, visibility } = body;
		return await createTopicHandler(
			{
				organizationId: activeOrganizationId as string,
				userId,
				name,
				description,
				defaultSubscription,
				visibility,
			},
			logger,
		);
	},
	{
		auth: true,
		body: TopicModel.createTopicBody,
		response: {
			201: TopicModel.topicResponse,
			409: TopicModel.topicAlreadyExists,
			403: TopicModel.unauthorized,
		},
		detail: {
			tags: ["Topics"],
			summary: "Create Topic",
			description: "Creates a new topic for the organization",
			responses: {
				201: {
					description: "Topic created successfully",
					content: {
						"application/json": {
							example: {
								object: "topic",
								id: "topic_123456789",
								name: "Newsletter",
								description: "Monthly newsletter subscribers",
								defaultSubscription: "opt_in",
								visibility: "public",
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
