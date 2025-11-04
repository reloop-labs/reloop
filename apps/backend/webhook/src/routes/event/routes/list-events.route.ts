import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { listEventsHandler } from "@reloop/webhook/routes/event/controllers/list-events";
import { EventModel } from "@reloop/webhook/routes/event/event.model";
import { Elysia, status } from "elysia";

export const listEventsRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await listEventsHandler(query);
	},
	{
		query: EventModel.eventQuery,
		response: {
			200: EventModel.eventListResponse,
			403: EventModel.unauthorized,
		},
		auth: true,
		detail: {
			tags: ["Events"],
			summary: "List webhook events",
			description: "Retrieves a paginated list of available webhook events",
		},
	},
);
