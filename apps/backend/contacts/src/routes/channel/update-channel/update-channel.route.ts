import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ChannelModel } from "@be/contacts/model/channel.model";
import { Elysia, t } from "elysia";
import { updateChannelController } from "./update-channel.controllers";
import { updateChannelXCodeSamples } from "./update-channel.x-codeSamples";

export const updateChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "update-channel",
		}),
	)
	.patch(
		"/:channel_id",
		async ({ params, body, activeOrganizationId }) => {
			const { name, description, visibility } = body;
			return await updateChannelController({
				activeOrganizationId,
				channel_id: params.channel_id,
				name,
				description: description ?? undefined,
				visibility,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({ channel_id: t.String({ description: "Channel ID" }) }),
			body: ChannelModel.updateChannelBody,
			response: {
				200: ChannelModel.channelResponse,
				404: ChannelModel.channelNotFound,
				409: ChannelModel.channelAlreadyExists,
				403: ChannelModel.unauthorized,
			},
			detail: {
				tags: ["Channels"],
				summary: "Update Channel",
				description: "Updates an existing channel",
				"x-codeSamples": updateChannelXCodeSamples,
			},
		},
	);
