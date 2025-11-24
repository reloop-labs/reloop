import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceModel } from "@be/audience/model/audience.model";
import { unsubscribeAudienceHandler } from "@be/audience/routes/audience/controllers/unsubscribe-audience";
import type { User } from "@reloop/auth/server";
import { Elysia, t } from "elysia";

export const unsubscribeAudienceRoute = new Elysia().use(authMiddleware).post(
	"/unsubscribe/:id",
	async ({
		params,
		body,
		user,
	}: {
		params: { id: string };
		body: AudienceModel.UnsubscribeAudienceBody;
		user: User;
	}) => {
		const { activeOrganizationId } = user;
		return await unsubscribeAudienceHandler(
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
		body: AudienceModel.unsubscribeAudienceBody,
		response: {
			200: AudienceModel.audienceResponse,
			404: AudienceModel.audienceNotFound,
			403: AudienceModel.unauthorized,
		},
		detail: {
			tags: ["Audience"],
			summary: "Unsubscribe an audience",
			description: "Changes an audience's status to unsubscribed",
		},
	},
);
