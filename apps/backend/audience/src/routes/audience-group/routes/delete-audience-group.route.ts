import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceGroupModel } from "@be/audience/model/audience-group.model";
import { deleteAudienceGroupHandler } from "@be/audience/routes/audience-group/controllers/delete-audience-group";
import type { User } from "@reloop/auth/server";
import { Elysia, t } from "elysia";

export const deleteAudienceGroupRoute = new Elysia().use(authMiddleware).delete(
	"/delete/:id",
	async ({ params, user }: { params: { id: string }; user: User }) => {
		const { activeOrganizationId } = user;
		return await deleteAudienceGroupHandler(
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
			200: t.Object({
				message: t.String(),
			}),
			404: AudienceGroupModel.audienceGroupNotFound,
			403: AudienceGroupModel.unauthorized,
		},
		detail: {
			tags: ["Audience Groups"],
			summary: "Delete an audience group",
			description: "Soft deletes an audience group and all its audiences",
		},
	},
);
