import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceModel } from "@be/audience/model/audience.model";
import { searchAudiencesHandler } from "@be/audience/routes/audience/controllers/search-audiences";
import { Elysia } from "elysia";

export const searchAudiencesRoute = new Elysia().use(authMiddleware).get(
	"/search",
	async ({ query, user }) => {
		const { activeOrganizationId } = user;
		return await searchAudiencesHandler(activeOrganizationId as string, query);
	},
	{
		auth: true,
		query: AudienceModel.searchAudiencesQuery,
		response: {
			200: AudienceModel.audienceListResponse,
			403: AudienceModel.unauthorized,
		},
		detail: {
			tags: ["Audience"],
			summary: "Search audiences",
			description: "Performs advanced search across audience fields",
		},
	},
);
