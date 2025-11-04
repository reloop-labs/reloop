import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceGroupModel } from "@reloop/audience/routes/audience-group/audience-group.model";
import { createAudienceGroupHandler } from "@reloop/audience/routes/audience-group/controllers/create-audience-group";
import { Elysia, status } from "elysia";

export const createAudienceGroupRoute = new Elysia().use(authMiddleware).post(
	"/add",
	async ({ body, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await createAudienceGroupHandler(
			user.activeOrganizationId,
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
