import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { GroupModel } from "@be/contacts/model/group.model";
import { createGroupController } from "@be/contacts/routes/group/create-group/create-group.controllers";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { Elysia } from "elysia";
import { createGroupXCodeSamples } from "./create-group.x-codeSamples";

export const createGroupRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "create-group" }),
	)
	.post(
		"/create",
		async ({ body, organizationId, userId }) => {
			const { name } = body;
			return await createGroupController({
				organizationId,
				userId,
				name,
			});
		},
		{
			auth: true,
			rateLimit: true,
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
			afterResponse: auditLogHook({
				resourceType: "group",
				action: "created",
				successStatus: 201,
			}),
		},
	);
