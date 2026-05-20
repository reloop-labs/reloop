import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ChannelModel } from "@be/contacts/model/channel.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { Elysia, t } from "elysia";
import { deleteChannelController } from "./delete-channel.controllers";
import { deleteChannelXCodeSamples } from "./delete-channel.x-codeSamples";

export const deleteChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "delete-channel",
		}),
	)
	.delete(
		"/:channel_id",
		async ({ params, organizationId }) => {
			return await deleteChannelController({
				organizationId,
				channel_id: params.channel_id,
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
			afterResponse: auditLogHook({
				resourceType: "channel",
				action: "deleted",
				successStatus: 200,
			}),
		},
	);
