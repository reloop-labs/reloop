import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { getDeliveryHandler } from "@reloop/webhook/routes/delivery/controllers/get-delivery";
import { DeliveryModel } from "@reloop/webhook/routes/delivery/delivery.model";
import { Elysia, status, t } from "elysia";

export const getDeliveryRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params: { id }, activeOrganizationId }) => {
		if (!activeOrganizationId) {
			throw status(403, {
				message: "Authentication required",
			});
		}
		return await getDeliveryHandler(id, activeOrganizationId);
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
