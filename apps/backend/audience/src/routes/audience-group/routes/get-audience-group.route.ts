import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceGroupModel } from "@be/audience/model/audience-group.model";
import { getAudienceGroupHandler } from "@be/audience/routes/audience-group/controllers/get-audience-group";
import type { User } from "@reloop/auth/server";
import { Elysia, t } from "elysia";

export const getAudienceGroupRoute = new Elysia().use(authMiddleware).get(
	"/get/:id",
	async ({ params, user }: { params: { id: string }; user: User }) => {
		const { activeOrganizationId } = user;
		return await getAudienceGroupHandler(
			params.id,
			activeOrganizationId as string,
		);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		response: {
			200: AudienceGroupModel.audienceGroupResponse,
			404: AudienceGroupModel.audienceGroupNotFound,
			403: AudienceGroupModel.unauthorized,
		},
		detail: {
			tags: ["Audience Groups"],
			summary: "Get an audience group",
			description: "Retrieves a specific audience group by ID",
		},
	},
);
