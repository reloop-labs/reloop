import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { Elysia, t } from "elysia";
import { listSubscriptionsController } from "./list-subscriptions.controllers";

export const listSubscriptionsRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 60,
			windowSeconds: 60,
			namespace: "list-subscriptions",
		}),
	)
	.get(
		"/list",
		async ({ query, organizationId }) => {
			return await listSubscriptionsController({
				organizationId: organizationId as string,
				query: {
					channelId: query.channelId,
					limit: query.limit as number | undefined,
					page: query.page as number | undefined,
				},
			});
		},
		{
			auth: true,
			rateLimit: true,
			query: t.Object({
				channelId: t.String({
					description: "ID of the channel to list enrollments for",
				}),
				limit: t.Optional(t.Numeric({ default: 100 })),
				page: t.Optional(t.Numeric({ default: 1 })),
			}),
			detail: {
				tags: ["Subscription"],
				summary: "List channel subscriptions",
				description:
					"Lists all contacts subscribed/enrolled to a specific channel",
			},
		},
	);
