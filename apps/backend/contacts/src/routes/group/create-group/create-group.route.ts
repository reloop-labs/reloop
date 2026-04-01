import { authMiddleware } from "@be/contacts/middleware/auth";
import { GroupModel } from "@be/contacts/model/group.model";
import { createGroupController } from "@be/contacts/routes/group/create-group/create-group.controllers";
import { Elysia } from "elysia";
import { createGroupXCodeSamples } from "./create-group.x-codeSamples";

export const createGroupRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, activeOrganizationId, userId, logger, cookie, path, request, headers }) => {
		const { name } = body;
		const cookieString = cookie?.toString() || "";
		return await createGroupController({
			activeOrganizationId,
			userId,
			name,
			logger,
			cookie: cookieString,
			requestDetails: {
				endpoint: path,
				method: request.method,
				userAgent: headers["user-agent"],
				ipAddress: (headers["x-forwarded-for"] as string) || (headers["x-real-ip"] as string),
			},
		});
	},
	{
		auth: true,
		body: GroupModel.createGroupBody,
		response: {
			201: GroupModel.groupResponse,
			409: GroupModel.groupAlreadyExists,
			403: GroupModel.unauthorized,
		},
		detail: {
			tags: ["Groups"],
			summary: "Create Group",
			description: "Creates a new group for the organization",
			"x-codeSamples": createGroupXCodeSamples,
		},
	},
);
