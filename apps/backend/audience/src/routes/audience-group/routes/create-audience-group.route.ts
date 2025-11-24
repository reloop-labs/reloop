import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceGroupModel } from "@be/audience/model/audience-group.model";
import { createAudienceGroupHandler } from "@be/audience/routes/audience-group/controllers/create-audience-group";
import { Elysia } from "elysia";

export const createAudienceGroupRoute = new Elysia().use(authMiddleware).post(
	"/add",
	async ({ body, user }) => {
		const { activeOrganizationId } = user;
		return await createAudienceGroupHandler(
			activeOrganizationId as string,
			user.id,
			body,
		);
	},
	{
		auth: true,
		body: AudienceGroupModel.createAudienceGroupBody,
		response: {
			201: AudienceGroupModel.audienceGroupResponse,
			409: AudienceGroupModel.validationError,
			400: AudienceGroupModel.validationError,
			403: AudienceGroupModel.unauthorized,
		},
		detail: {
			tags: ["Audience Groups"],
			summary: "Create a new audience group",
			description: "Creates a new audience group for the user's organization",
		},
	},
);
