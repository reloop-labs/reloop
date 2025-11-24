import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceModel } from "@be/audience/model/audience.model";
import { listAudiencesHandler } from "@be/audience/routes/audience/controllers/list-audiences";
import { Elysia, status } from "elysia";

export const listAudiencesRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not an active organization member",
			});
		}
		return await listAudiencesHandler(user.activeOrganizationId, query);
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
