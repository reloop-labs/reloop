import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceModel } from "@be/audience/model/audience.model";
import { listAudiencesHandler } from "@be/audience/routes/audience/controllers/list-audiences";
import { Elysia } from "elysia";

export const listAudiencesRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, user }) => {
		const { activeOrganizationId } = user;
		return await listAudiencesHandler(activeOrganizationId, query);
	},
	{
		auth: true,
		query: AudienceModel.audienceQuery,
		response: {
			200: AudienceModel.audienceListResponse,
			403: AudienceModel.unauthorized,
		},
		detail: {
			tags: ["Audience"],
			summary: "List audiences",
			description:
				"Retrieves a paginated list of audiences with optional filtering and search",
		},
	},
);
