import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { getEventHandler } from "@reloop/webhook/routes/event/controllers/get-event";
import { EventModel } from "@reloop/webhook/routes/event/event.model";
import { Elysia, status, t } from "elysia";

export const getEventRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params: { id }, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await getEventHandler(id);
	},
	{
		auth: true,
		params: t.Object({
			id: EventModel.eventIdParam,
		}),
		response: {
			200: EventModel.eventResponse,
			404: EventModel.eventNotFound,
			403: EventModel.unauthorized,
		},
		detail: {
			tags: ["Events"],
			summary: "Get event by ID",
			description: "Retrieves an event by its ID",
		},
	},
);
