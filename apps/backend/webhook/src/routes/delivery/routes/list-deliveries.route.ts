import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { listDeliveriesHandler } from "@reloop/webhook/routes/delivery/controllers/list-deliveries";
import { DeliveryModel } from "@reloop/webhook/routes/delivery/delivery.model";
import { Elysia, status } from "elysia";

export const listDeliveriesRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await listDeliveriesHandler(query, user.activeOrganizationId);
	},
	{
		query: DeliveryModel.deliveryQuery,
		response: {
			200: DeliveryModel.deliveryListResponse,
			403: DeliveryModel.unauthorized,
		},
		auth: true,
		detail: {
			tags: ["Deliveries"],
			summary: "List deliveries",
			description:
				"Retrieves a paginated list of webhook deliveries with optional filters",
		},
	},
);
