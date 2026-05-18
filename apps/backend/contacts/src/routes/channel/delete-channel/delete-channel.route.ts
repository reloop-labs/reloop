import { authMiddleware } from "@be/contacts/middleware/auth";
import { ChannelModel } from "@be/contacts/model/channel.model";
import { Elysia, t } from "elysia";
import { deleteChannelController } from "./delete-channel.controllers";
import { deleteChannelXCodeSamples } from "./delete-channel.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const deleteChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "delete-channel" }))
	.delete(
	"/:channel_id",
	async ({ params, activeOrganizationId, logger, path, request, headers }) => {
		const cookieString = headers["cookie"] || "";
		return await deleteChannelController({
			activeOrganizationId,
			channel_id: params.channel_id,
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
		params: t.Object({ channel_id: t.String({ description: "Channel ID" }) }),
		response: {
			200: ChannelModel.deleteResponse,
			404: ChannelModel.channelNotFound,
			403: ChannelModel.unauthorized,
		},
		detail: {
			tags: ["Channels"],
			summary: "Delete Channel",
			description: "Soft deletes a channel",
			"x-codeSamples": deleteChannelXCodeSamples,
		},
	},
);
