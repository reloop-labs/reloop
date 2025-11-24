import { authMiddleware } from "@be/audience/middleware/auth";
import { createAudienceGroupRoute } from "@be/audience/routes/audience-group/routes/create-audience-group.route";
import { deleteAudienceGroupRoute } from "@be/audience/routes/audience-group/routes/delete-audience-group.route";
import { getAudienceGroupRoute } from "@be/audience/routes/audience-group/routes/get-audience-group.route";
import { listAudienceGroupsRoute } from "@be/audience/routes/audience-group/routes/list-audience-groups.route";
import { updateAudienceGroupRoute } from "@be/audience/routes/audience-group/routes/update-audience-group.route";
import { Elysia } from "elysia";

export const audienceGroupRoutes = new Elysia({
	prefix: "/v1/groups",
	name: "AudienceGroupRoutes",
})
	.use(authMiddleware)
	// Audience Group Routes
	.use(createAudienceGroupRoute)
	.use(getAudienceGroupRoute)
	.use(listAudienceGroupsRoute)
	.use(updateAudienceGroupRoute)
	.use(deleteAudienceGroupRoute);
