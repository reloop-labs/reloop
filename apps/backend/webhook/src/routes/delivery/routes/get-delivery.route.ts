import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { getDeliveryHandler } from "@reloop/webhook/routes/delivery/controllers/get-delivery";
import { DeliveryModel } from "@reloop/webhook/routes/delivery/delivery.model";
import { Elysia, status, t } from "elysia";

export const getDeliveryRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params: { id }, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await getDeliveryHandler(id, user.activeOrganizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: DeliveryModel.deliveryIdParam,
		}),
		response: {
			200: DeliveryModel.deliveryResponse,
			404: DeliveryModel.deliveryNotFound,
			403: DeliveryModel.unauthorized,
		},
		detail: {
			tags: ["Deliveries"],
			summary: "Get delivery by ID",
			description: "Retrieves a delivery by its ID",
		},
	},
);
