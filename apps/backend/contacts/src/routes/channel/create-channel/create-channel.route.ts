import { authMiddleware } from "@be/contacts/middleware/auth";
import { ChannelModel } from "@be/contacts/model/channel.model";
import { Elysia } from "elysia";
import { createChannelController } from "./create-channel.controllers";
import { createChannelXCodeSamples } from "./create-channel.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const createChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "create-channel" }))
	.post(
	"/create",
	async ({
		body,
		activeOrganizationId,
		userId,
		path,
		request,
		headers,
	}) => {
		const { name, description, defaultSubscription, visibility } = body;
		const cookieString = headers["cookie"] || "";
		return await createChannelController({
			activeOrganizationId,
			userId,
			name,
			description,
			defaultSubscription,
			visibility,
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
		body: ChannelModel.createChannelBody,
		response: {
			201: ChannelModel.channelResponse,
			409: ChannelModel.channelAlreadyExists,
			403: ChannelModel.unauthorized,
		},
		detail: {
			tags: ["Channels"],
			summary: "Create Channel",
			description: "Creates a new channel for the organization",
			"x-codeSamples": createChannelXCodeSamples,
		},
	},
);
