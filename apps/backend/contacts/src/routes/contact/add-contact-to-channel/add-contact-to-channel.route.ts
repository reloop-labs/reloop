import { authMiddleware } from "@be/contacts/middleware/auth";
import { ChannelSubscriptionModel } from "@be/contacts/model/channel-subscription.model";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { addContactToChannelController } from "./add-contact-to-channel.controllers";
import { addContactToChannelXCodeSamples } from "./add-contact-to-channel.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const addContactToChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "add-channel" }))
	.post(
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
		return await addContactToChannelController({
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
		body: ContactModel.addContactToChannelBody,
		response: {
			201: ContactModel.addContactToChannelResponse,
			404: ChannelSubscriptionModel.notFound,
			409: ChannelSubscriptionModel.subscriptionAlreadyExists,
			400: ContactModel.invalidEmail,
			403: ContactModel.unauthorized,
		},
		detail: {
			tags: ["Contact"],
			summary: "Add Contact Channel",
			description:
				"Creates a contact (if not exists) and enrolls them in a channel in one operation",
			"x-codeSamples": addContactToChannelXCodeSamples,
		},
	},
);
