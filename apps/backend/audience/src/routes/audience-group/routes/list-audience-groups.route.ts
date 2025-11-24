import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceGroupModel } from "@be/audience/model/audience-group.model";
import { listAudienceGroupsHandler } from "@be/audience/routes/audience-group/controllers/list-audience-groups";
import { Elysia } from "elysia";

export const listAudienceGroupsRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, user }) => {
		const { activeOrganizationId } = user;
		return await listAudienceGroupsHandler(
			activeOrganizationId as string,
			query,
		);
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
