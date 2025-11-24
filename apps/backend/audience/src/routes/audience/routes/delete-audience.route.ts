import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceModel } from "@be/audience/model/audience.model";
import { deleteAudienceHandler } from "@be/audience/routes/audience/controllers/delete-audience";
import type { User } from "@reloop/auth/server";
import { Elysia, status, t } from "elysia";

export const deleteAudienceRoute = new Elysia().use(authMiddleware).delete(
	"/delete/:id",
	async ({ params, user }: { params: { id: string }; user: User }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await deleteAudienceHandler(params.id, user.activeOrganizationId);
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
			404: AudienceModel.audienceNotFound,
			403: AudienceModel.unauthorized,
		},
		detail: {
			tags: ["Audience"],
			summary: "Delete an audience",
			description: "Removes an audience from its group",
		},
	},
);
