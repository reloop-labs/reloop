import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceModel } from "@be/audience/model/audience.model";
import { updateAudienceHandler } from "@be/audience/routes/audience/controllers/update-audience";
import type { User } from "@reloop/auth/server";
import { Elysia, t } from "elysia";

export const updateAudienceRoute = new Elysia().use(authMiddleware).put(
	"/update/:id",
	async ({
		params,
		body,
		user,
	}: {
		params: { id: string };
		body: AudienceModel.UpdateAudienceBody;
		user: User;
	}) => {
		const { activeOrganizationId } = user;
		return await updateAudienceHandler(
			params.id,
			activeOrganizationId as string,
			body,
		);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		body: AudienceModel.updateAudienceBody,
		response: {
			200: AudienceModel.audienceResponse,
			404: AudienceModel.audienceNotFound,
			400: AudienceModel.validationError,
			403: AudienceModel.unauthorized,
		},
		detail: {
			tags: ["Audience"],
			summary: "Update an audience",
			description: "Updates an existing audience's information",
		},
	},
);
