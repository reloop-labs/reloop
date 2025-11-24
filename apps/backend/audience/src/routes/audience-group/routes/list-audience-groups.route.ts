import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceGroupModel } from "@be/audience/model/audience-group.model";
import { listAudienceGroupsHandler } from "@be/audience/routes/audience-group/controllers/list-audience-groups";
import { Elysia, status } from "elysia";

export const listAudienceGroupsRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await listAudienceGroupsHandler(user.activeOrganizationId, query);
	},
	{
		auth: true,
		query: AudienceGroupModel.audienceGroupQuery,
		response: {
			200: AudienceGroupModel.audienceGroupListResponse,
			403: AudienceGroupModel.unauthorized,
		},
		detail: {
			tags: ["Audience Groups"],
			summary: "List audience groups",
			description:
				"Retrieves a paginated list of audience groups with optional filtering",
		},
	},
);
