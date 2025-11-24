import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceGroupModel } from "@be/audience/model/audience-group.model";
import { updateAudienceGroupHandler } from "@be/audience/routes/audience-group/controllers/update-audience-group";
import type { User } from "@reloop/auth/server";
import { Elysia, status, t } from "elysia";

export const updateAudienceGroupRoute = new Elysia().use(authMiddleware).put(
	"/update/:id",
	async ({
		params,
		body,
		user,
	}: {
		params: { id: string };
		body: AudienceGroupModel.UpdateAudienceGroupBody;
		user: User;
	}) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await updateAudienceGroupHandler(
			params.id,
			user.activeOrganizationId,
			body,
		);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		body: AudienceGroupModel.updateAudienceGroupBody,
		response: {
			200: AudienceGroupModel.audienceGroupResponse,
			404: AudienceGroupModel.audienceGroupNotFound,
			409: AudienceGroupModel.validationError,
			400: AudienceGroupModel.validationError,
			403: AudienceGroupModel.unauthorized,
		},
		detail: {
			tags: ["Audience Groups"],
			summary: "Update an audience group",
			description: "Updates an existing audience group",
		},
	},
);
