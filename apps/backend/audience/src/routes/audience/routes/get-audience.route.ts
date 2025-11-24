import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceModel } from "@be/audience/model/audience.model";
import { getAudienceHandler } from "@be/audience/routes/audience/controllers/get-audience";
import type { User } from "@reloop/auth/server";
import { Elysia, t } from "elysia";

export const getAudienceRoute = new Elysia().use(authMiddleware).get(
	"/get/:id",
	async ({ params, user }: { params: { id: string }; user: User }) => {
		const { activeOrganizationId } = user;
		return await getAudienceHandler(params.id, activeOrganizationId as string);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		response: {
			200: AudienceModel.audienceResponse,
			404: AudienceModel.audienceNotFound,
			403: AudienceModel.unauthorized,
		},
		detail: {
			tags: ["Audience"],
			summary: "Get an audience",
			description: "Retrieves a specific audience by ID",
		},
	},
);
