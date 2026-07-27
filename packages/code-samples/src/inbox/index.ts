import type { CodeSample } from "../types";

import { createMailboxXCodeSamples } from "./mailbox/create-mailbox/create-mailbox";
import { deleteMailboxXCodeSamples } from "./mailbox/delete-mailbox/delete-mailbox";
import { getMailboxXCodeSamples } from "./mailbox/get-mailbox/get-mailbox";
import { listMailboxesXCodeSamples } from "./mailbox/list-mailboxes/list-mailboxes";
import { updateMailboxXCodeSamples } from "./mailbox/update-mailbox/update-mailbox";
import { batchGetMessagesXCodeSamples } from "./messages/batch-get-messages/batch-get-messages";
import { cancelPendingXCodeSamples } from "./messages/cancel-pending/cancel-pending";
import { deleteMessageXCodeSamples } from "./messages/delete-message/delete-message";
import { forwardMessageXCodeSamples } from "./messages/forward-message/forward-message";
import { getMessageAttachmentXCodeSamples } from "./messages/get-message-attachment/get-message-attachment";
import { getMessageXCodeSamples } from "./messages/get-message/get-message";
import { getRawMessageXCodeSamples } from "./messages/get-raw-message/get-raw-message";
import { listMessagesXCodeSamples } from "./messages/list-messages/list-messages";
import { listSentMessagesXCodeSamples } from "./messages/list-sent-messages/list-sent-messages";
import { markMessageReadXCodeSamples } from "./messages/mark-message-read/mark-message-read";
import { replyAllToMessageXCodeSamples } from "./messages/reply-all-to-message/reply-all-to-message";
import { replyToMessageXCodeSamples } from "./messages/reply-to-message/reply-to-message";
import { sendMessageXCodeSamples } from "./messages/send-message/send-message";
import { toggleMessageStarXCodeSamples } from "./messages/toggle-message-star/toggle-message-star";
import { updateMessageXCodeSamples } from "./messages/update-message/update-message";
import { archiveThreadXCodeSamples } from "./threads/archive-thread/archive-thread";
import { batchThreadsXCodeSamples } from "./threads/batch-threads/batch-threads";
import { deleteThreadXCodeSamples } from "./threads/delete-thread/delete-thread";
import { getThreadAttachmentXCodeSamples } from "./threads/get-thread-attachment/get-thread-attachment";
import { getThreadXCodeSamples } from "./threads/get-thread/get-thread";
import { listThreadsXCodeSamples } from "./threads/list-threads/list-threads";
import { markThreadReadXCodeSamples } from "./threads/mark-thread-read/mark-thread-read";
import { restoreThreadXCodeSamples } from "./threads/restore-thread/restore-thread";
import { toggleThreadStarXCodeSamples } from "./threads/toggle-thread-star/toggle-thread-star";
import { trashThreadXCodeSamples } from "./threads/trash-thread/trash-thread";
import { updateThreadXCodeSamples } from "./threads/update-thread/update-thread";

export { createMailboxXCodeSamples };
export { deleteMailboxXCodeSamples };
export { getMailboxXCodeSamples };
export { listMailboxesXCodeSamples };
export { updateMailboxXCodeSamples };
export { batchGetMessagesXCodeSamples };
export { cancelPendingXCodeSamples };
export { deleteMessageXCodeSamples };
export { forwardMessageXCodeSamples };
export { getMessageAttachmentXCodeSamples };
export { getMessageXCodeSamples };
export { getRawMessageXCodeSamples };
export { listMessagesXCodeSamples };
export { listSentMessagesXCodeSamples };
export { markMessageReadXCodeSamples };
export { replyAllToMessageXCodeSamples };
export { replyToMessageXCodeSamples };
export { sendMessageXCodeSamples };
export { toggleMessageStarXCodeSamples };
export { updateMessageXCodeSamples };
export { archiveThreadXCodeSamples };
export { batchThreadsXCodeSamples };
export { deleteThreadXCodeSamples };
export { getThreadAttachmentXCodeSamples };
export { getThreadXCodeSamples };
export { listThreadsXCodeSamples };
export { markThreadReadXCodeSamples };
export { restoreThreadXCodeSamples };
export { toggleThreadStarXCodeSamples };
export { trashThreadXCodeSamples };
export { updateThreadXCodeSamples };

export const inboxSamples = {
	createMailbox: createMailboxXCodeSamples,
	deleteMailbox: deleteMailboxXCodeSamples,
	getMailbox: getMailboxXCodeSamples,
	listMailboxes: listMailboxesXCodeSamples,
	updateMailbox: updateMailboxXCodeSamples,
	batchGetMessages: batchGetMessagesXCodeSamples,
	cancelPending: cancelPendingXCodeSamples,
	deleteMessage: deleteMessageXCodeSamples,
	forwardMessage: forwardMessageXCodeSamples,
	getMessageAttachment: getMessageAttachmentXCodeSamples,
	getMessage: getMessageXCodeSamples,
	getRawMessage: getRawMessageXCodeSamples,
	listMessages: listMessagesXCodeSamples,
	listSentMessages: listSentMessagesXCodeSamples,
	markMessageRead: markMessageReadXCodeSamples,
	replyAllToMessage: replyAllToMessageXCodeSamples,
	replyToMessage: replyToMessageXCodeSamples,
	sendMessage: sendMessageXCodeSamples,
	toggleMessageStar: toggleMessageStarXCodeSamples,
	updateMessage: updateMessageXCodeSamples,
	archiveThread: archiveThreadXCodeSamples,
	batchThreads: batchThreadsXCodeSamples,
	deleteThread: deleteThreadXCodeSamples,
	getThreadAttachment: getThreadAttachmentXCodeSamples,
	getThread: getThreadXCodeSamples,
	listThreads: listThreadsXCodeSamples,
	markThreadRead: markThreadReadXCodeSamples,
	restoreThread: restoreThreadXCodeSamples,
	toggleThreadStar: toggleThreadStarXCodeSamples,
	trashThread: trashThreadXCodeSamples,
	updateThread: updateThreadXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type InboxSampleKey = keyof typeof inboxSamples;
