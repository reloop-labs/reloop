import { authMiddleware } from "@reloop/audience/middleware/auth";
import { bulkImportAudiencesRoute } from "@reloop/audience/routes/audience/routes/bulk-import-audiences.route";
import { createAudienceRoute } from "@reloop/audience/routes/audience/routes/create-audience.route";
import { deleteAudienceRoute } from "@reloop/audience/routes/audience/routes/delete-audience.route";
import { getAudienceRoute } from "@reloop/audience/routes/audience/routes/get-audience.route";
import { listAudiencesRoute } from "@reloop/audience/routes/audience/routes/list-audiences.route";
import { searchAudiencesRoute } from "@reloop/audience/routes/audience/routes/search-audiences.route";
import { subscribeAudienceRoute } from "@reloop/audience/routes/audience/routes/subscribe-audience.route";
import { unsubscribeAudienceRoute } from "@reloop/audience/routes/audience/routes/unsubscribe-audience.route";
import { updateAudienceRoute } from "@reloop/audience/routes/audience/routes/update-audience.route";
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
	// Bulk Operations
	.use(bulkImportAudiencesRoute)
	// Status Management
	.use(subscribeAudienceRoute)
	.use(unsubscribeAudienceRoute)
	// Search
	.use(searchAudiencesRoute);
