import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { retryDeliveryHandler } from "@reloop/webhook/routes/delivery/controllers/retry-delivery";
import { DeliveryModel } from "@reloop/webhook/routes/delivery/delivery.model";
import { Elysia, status, t } from "elysia";

export const retryDeliveryRoute = new Elysia().use(authMiddleware).post(
	"/:id/retry",
	async ({ params: { id }, body, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await retryDeliveryHandler(id, user.activeOrganizationId, body);
	},
	{
		auth: true,
		params: t.Object({
			id: DeliveryModel.deliveryIdParam,
		}),
		body: DeliveryModel.retryDeliveryBody,
		response: {
			200: t.Object({
				message: t.String(),
			}),
			404: DeliveryModel.deliveryNotFound,
			400: DeliveryModel.retryNotAllowed,
			403: DeliveryModel.unauthorized,
		},
		detail: {
			tags: ["Deliveries"],
			summary: "Retry delivery",
			description: "Manually retry a failed webhook delivery",
		},
	},
);
