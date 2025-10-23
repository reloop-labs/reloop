import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { getDeliveryRoute } from "@reloop/webhook/routes/delivery/routes/get-delivery.route";
import { listDeliveriesRoute } from "@reloop/webhook/routes/delivery/routes/list-deliveries.route";
import { retryDeliveryRoute } from "@reloop/webhook/routes/delivery/routes/retry-delivery.route";
import { Elysia } from "elysia";

export const deliveryRoutes = new Elysia({
    prefix: "/deliveries",
    name: "DeliveryRoutes",
})
    .use(authMiddleware)
    .use(getDeliveryRoute)
    .use(listDeliveriesRoute)
    .use(retryDeliveryRoute);
