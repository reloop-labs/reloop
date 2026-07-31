import { createCustomEventRoute } from "@be/workflow/routes/custom-event/create-custom-event/create-custom-event.route";
import { deleteCustomEventRoute } from "@be/workflow/routes/custom-event/delete-custom-event/delete-custom-event.route";
import { getCustomEventRoute } from "@be/workflow/routes/custom-event/get-custom-event/get-custom-event.route";
import { listCustomEventsRoute } from "@be/workflow/routes/custom-event/list-custom-events/list-custom-events.route";
import { trackCustomEventRoute } from "@be/workflow/routes/custom-event/track-custom-event/track-custom-event.route";
import { updateCustomEventRoute } from "@be/workflow/routes/custom-event/update-custom-event/update-custom-event.route";
import { Elysia } from "elysia";

export const customEventRoutes = new Elysia({
	prefix: "/v1/events",
	name: "CustomEventRoutes",
})
	.use(createCustomEventRoute)
	.use(listCustomEventsRoute)
	.use(trackCustomEventRoute)
	.use(getCustomEventRoute)
	.use(updateCustomEventRoute)
	.use(deleteCustomEventRoute);
