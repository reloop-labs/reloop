import { authMiddleware } from "@be/contacts/middleware/auth";
import { ChannelModel } from "@be/contacts/model/channel.model";
import { Elysia, t } from "elysia";
import { getChannelController } from "./get-channel.controllers";
import { getChannelXCodeSamples } from "./get-channel.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const getChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 60, windowSeconds: 60, namespace: "get-channel" }))
	.get(
	"/:channel_id",
	async ({ params, activeOrganizationId, logger }) => {
		return await getChannelController({
			activeOrganizationId,
			channel_id: params.channel_id,
		});
	},
	{
		auth: true,
		rateLimit: true,
		params: t.Object({ channel_id: t.String({ description: "Channel ID" }) }),
		response: {
			200: ChannelModel.channelBaseResponse,
			404: ChannelModel.channelNotFound,
			403: ChannelModel.unauthorized,
		},
		detail: {
			tags: ["Channels"],
			summary: "Retrieve Channel",
			description: "Retrieves a specific channel by ID",
			"x-codeSamples": getChannelXCodeSamples,
		},
	},
);
