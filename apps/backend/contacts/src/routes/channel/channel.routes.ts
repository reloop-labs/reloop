import { authMiddleware } from "@be/contacts/middleware/auth";
import { createChannelRoute } from "@be/contacts/routes/channel/create-channel/create-channel.route";
import { deleteChannelRoute } from "@be/contacts/routes/channel/delete-channel/delete-channel.route";
import { getChannelRoute } from "@be/contacts/routes/channel/get-channel/get-channel.route";
import { listChannelsRoute } from "@be/contacts/routes/channel/list-channels/list-channels.route";
import { updateChannelRoute } from "@be/contacts/routes/channel/update-channel/update-channel.route";
import { Elysia } from "elysia";

export const channelRoutes = new Elysia({
	prefix: "/v1/channels",
	name: "ChannelRoutes",
})
	.use(authMiddleware)
	.use(createChannelRoute)
	.use(getChannelRoute)
	.use(listChannelsRoute)
	.use(updateChannelRoute)
	.use(deleteChannelRoute);
