import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ChannelModel } from "@be/contacts/model/channel.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { updateChannelXCodeSamples } from "@reloop/code-samples/contacts";
import { Elysia, t } from "elysia";
import { updateChannelController } from "./update-channel.controllers";

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
		async ({ params, body, organizationId }) => {
			const { name, description, visibility, defaultSubscription } = body;
			return await updateChannelController({
				organizationId,
				channel_id: params.channel_id,
				name,
				description: description ?? undefined,
				visibility,
				defaultSubscription,
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
			afterResponse: auditLogHook({
				resourceType: "channel",
				action: "updated",
				successStatus: 200,
			}),
		},
	);
