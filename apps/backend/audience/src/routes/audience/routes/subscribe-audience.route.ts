import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceModel } from "@be/audience/model/audience.model";
import { subscribeAudienceHandler } from "@be/audience/routes/audience/controllers/subscribe-audience";
import type { User } from "@reloop/auth/server";
import { Elysia, t } from "elysia";

export const subscribeAudienceRoute = new Elysia().use(authMiddleware).post(
	"/subscribe/:id",
	async ({
		params,
		body,
		user,
	}: {
		params: { id: string };
		body: AudienceModel.SubscribeAudienceBody;
		user: User;
	}) => {
		const { activeOrganizationId } = user;
		return await subscribeAudienceHandler(
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
		body: AudienceModel.subscribeAudienceBody,
		response: {
			200: AudienceModel.audienceResponse,
			404: AudienceModel.audienceNotFound,
			403: AudienceModel.unauthorized,
		},
		detail: {
			tags: ["Audience"],
			summary: "Subscribe an audience",
			description: "Changes an audience's status to subscribed",
		},
	},
);
