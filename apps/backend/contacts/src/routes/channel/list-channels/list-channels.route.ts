import { authMiddleware } from "@be/contacts/middleware/auth";
import { ChannelModel } from "@be/contacts/model/channel.model";
import { Elysia } from "elysia";
import { listChannelsController } from "./list-channels.controllers";
import { listChannelsXCodeSamples } from "./list-channels.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const listChannelsRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 60, windowSeconds: 60, namespace: "list-channels" }))
	.get(
	"/list",
	async ({ query, activeOrganizationId, logger }) => {
		return await listChannelsController({
			activeOrganizationId,
			page: query.page,
			limit: query.limit,
			logger,
		});
	},
	{
		auth: true,
		rateLimit: true,
		query: ChannelModel.channelQuery,
		response: {
			200: ChannelModel.channelListResponse,
			403: ChannelModel.unauthorized,
		},
		detail: {
			tags: ["Channels"],
			summary: "List Channels",
			description: "Retrieves a paginated list of channels",
			"x-codeSamples": listChannelsXCodeSamples,
		},
	},
);
