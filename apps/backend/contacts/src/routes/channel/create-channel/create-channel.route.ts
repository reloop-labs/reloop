import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ChannelModel } from "@be/contacts/model/channel.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { createChannelXCodeSamples } from "@reloop/code-samples/contacts";
import { Elysia } from "elysia";
import { createChannelController } from "./create-channel.controllers";

export const createChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "create-channel",
		}),
	)
	.post(
		"/create",
		async ({ body, organizationId, userId }) => {
			const { name, description, defaultSubscription, visibility } = body;
			return await createChannelController({
				organizationId,
				userId,
				name,
				description,
				defaultSubscription,
				visibility,
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
			afterResponse: auditLogHook({
				resourceType: "channel",
				action: "created",
				successStatus: 201,
			}),
		},
	);
