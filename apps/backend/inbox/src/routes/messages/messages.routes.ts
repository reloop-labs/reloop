import { Elysia } from "elysia";
import { batchGetMessagesRoute } from "./batch-get-messages/batch-get-messages.route";
import { cancelPendingRoute } from "./cancel-pending/cancel-pending.route";
import { deleteMessageRoute } from "./delete-message/delete-message.route";
import { forwardMessageRoute } from "./forward-message/forward-message.route";
import { getMessageRoute } from "./get-message/get-message.route";
import { getMessageAttachmentRoute } from "./get-message-attachment/get-message-attachment.route";
import { getRawMessageRoute } from "./get-raw-message/get-raw-message.route";
import { listMessagesRoute } from "./list-messages/list-messages.route";
import { listSentMessagesRoute } from "./list-sent-messages/list-sent-messages.route";
import { markMessageReadRoute } from "./mark-message-read/mark-message-read.route";
import { replyAllToMessageRoute } from "./reply-all-to-message/reply-all-to-message.route";
import { replyToMessageRoute } from "./reply-to-message/reply-to-message.route";
import { sendMessageRoute } from "./send-message/send-message.route";
import { toggleMessageStarRoute } from "./toggle-message-star/toggle-message-star.route";
import { updateMessageRoute } from "./update-message/update-message.route";

export const messagesRoutes = new Elysia({
	prefix: "/v1/messages",
	name: "MessagesRoutes",
})
	.use(listMessagesRoute)
	.use(listSentMessagesRoute)
	.use(getMessageRoute)
	.use(batchGetMessagesRoute)
	.use(getMessageAttachmentRoute)
	.use(getRawMessageRoute)
	.use(updateMessageRoute)
	.use(markMessageReadRoute)
	.use(toggleMessageStarRoute)
	.use(deleteMessageRoute)
	.use(sendMessageRoute)
	.use(cancelPendingRoute)
	.use(replyToMessageRoute)
	.use(replyAllToMessageRoute)
	.use(forwardMessageRoute);
