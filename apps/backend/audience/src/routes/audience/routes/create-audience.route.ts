import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceModel } from "@be/audience/model/audience.model";
import { AudienceGroupModel } from "@be/audience/model/audience-group.model";
import { createAudienceHandler } from "@be/audience/routes/audience/controllers/create-audience";
import { Elysia } from "elysia";

export const createAudienceRoute = new Elysia().use(authMiddleware).post(
	"/add",
	async ({ body, user }) => {
		const { activeOrganizationId } = user;
		return await createAudienceHandler(activeOrganizationId, body);
	},
	{
		auth: true,
		body: AudienceModel.createAudienceBody,
		response: {
			201: AudienceModel.audienceResponse,
			409: AudienceModel.audienceAlreadyExists,
			404: AudienceGroupModel.audienceGroupNotFound,
			400: AudienceModel.invalidEmail,
			403: AudienceModel.unauthorized,
		},
		detail: {
			tags: ["Audience"],
			summary: "Create a new audience",
			description: "Adds a new audience to an audience group",
		},
	},
);
