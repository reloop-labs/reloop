import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { updateContactChannelController } from "./update-contact-channel.controllers";
import { updateContactChannelXCodeSamples } from "./update-contact-channel.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const updateContactChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "update-channel" }))
	.patch(
	"/channel/:channel_id",
	async ({
		body,
		params,
		activeOrganizationId,
		path,
		request,
		headers,
	}) => {
		const cookieString = headers["cookie"] || "";
		return await updateContactChannelController({
			organizationId: activeOrganizationId,
			channelId: params.channel_id,
			body,
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
		params: t.Object({ channel_id: t.String() }),
		body: ContactModel.updateContactChannelBody,
		response: {
			200: ContactModel.updateContactChannelResponse,
			400: t.Object({ message: t.String() }),
			404: t.Object({ message: t.String() }),
		},
		detail: {
			tags: ["Contact"],
			summary: "Update Contact Channel",
			description: "Updates a contact's enrollment status in a channel",
			"x-codeSamples": updateContactChannelXCodeSamples,
		},
	},
);
