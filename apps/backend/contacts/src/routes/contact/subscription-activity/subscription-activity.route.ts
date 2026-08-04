import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { subscriptionActivityController } from "./subscription-activity.controllers";

export const subscriptionActivityRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 60,
			windowSeconds: 60,
			namespace: "subscription-activity",
		}),
	)
	.get(
		"/stats/subscription-activity",
		async ({ organizationId, query }) => {
			return await subscriptionActivityController({
				organizationId: organizationId as string,
				days: query.days,
			});
		},
		{
			auth: true,
			rateLimit: true,
			query: t.Object({
				days: t.Optional(
					t.Numeric({
						minimum: 1,
						maximum: 30,
						default: 7,
						description: "Number of UTC days to include (1–30)",
					}),
				),
			}),
			response: {
				200: ContactModel.subscriptionActivityResponse,
				403: ContactModel.unauthorized,
			},
			detail: {
				tags: ["Contact"],
				summary: "Subscription activity",
				description:
					"Daily new subscribed contacts and unsubscribed updates over a recent window (UTC).",
			},
		},
	);
