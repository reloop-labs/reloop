import { authMiddleware } from "@be/audience/middleware/auth";
import { createAudienceRoute } from "@be/audience/routes/audience/routes/create-audience.route";
import { deleteAudienceRoute } from "@be/audience/routes/audience/routes/delete-audience.route";
import { getAudienceRoute } from "@be/audience/routes/audience/routes/get-audience.route";
import { listAudiencesRoute } from "@be/audience/routes/audience/routes/list-audiences.route";
import { searchAudiencesRoute } from "@be/audience/routes/audience/routes/search-audiences.route";
import { updateAudienceRoute } from "@be/audience/routes/audience/routes/update-audience.route";
import { Elysia } from "elysia";

export const audienceRoutes = new Elysia({
	prefix: "/v1",
	name: "AudienceRoutes",
})
	.use(authMiddleware)
	// Audience Routes
	.use(createAudienceRoute)
	.use(getAudienceRoute)
	.use(listAudiencesRoute)
	.use(updateAudienceRoute)
	.use(deleteAudienceRoute)
	// Search
	.use(searchAudiencesRoute);
