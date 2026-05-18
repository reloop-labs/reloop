import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { addContactToGroupController } from "./add-contact-to-group.controllers";
import { addContactToGroupXCodeSamples } from "./add-contact-to-group.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const addContactToGroupRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "add-group" }))
	.post(
	"/group/:group_id",
	async ({
		body,
		params,
		activeOrganizationId,
		logger,
		path,
		request,
		headers,
	}) => {
		const cookieString = headers["cookie"] || "";
		return await addContactToGroupController({
			organizationId: activeOrganizationId,
			groupId: params.group_id,
			body,
			logger,
			cookie: cookieString,
			requestDetails: {
				endpoint: path,
				method: request.method,
				userAgent: headers["user-agent"],
				ipAddress:
					(headers["x-forwarded-for"] as string) ||
					(headers["x-real-ip"] as string),
			},
		});
	},
	{
		auth: true,
		rateLimit: true,
		params: t.Object({ group_id: t.String() }),
		body: ContactModel.addContactToGroupBody,
		response: {
			200: ContactModel.addContactToGroupResponse,
			400: t.Object({ message: t.String() }),
			404: t.Object({ message: t.String() }),
		},
		detail: {
			tags: ["Contact"],
			summary: "Add Contact Group",
			description: "Adds a contact to a group by ID or email",
			"x-codeSamples": addContactToGroupXCodeSamples,
		},
	},
);
