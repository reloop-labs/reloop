import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { inboxEndpoints } from "./endpoints";
import type {
	InboxActionResponse,
	InboxForwardInput,
	InboxMessage,
	InboxReplyInput,
	InboxSendResponse,
	InboxThread,
	InboxThreadDetail,
	InboxThreadStatus,
	Mailbox,
	MailboxSendInput,
	MailboxSentMessage,
} from "./types";

const MAILBOX_CODES: ErrorCodeMap = { 404: "mailbox_not_found" };
const MESSAGE_CODES: ErrorCodeMap = { 404: "message_not_found" };
const THREAD_CODES: ErrorCodeMap = { 404: "thread_not_found" };

export type ListInboxMessagesQuery = {
	mailboxId?: string;
	limit?: number;
	offset?: number;
	q?: string;
	isSpam?: boolean;
};

export type ListInboxThreadsQuery = {
	mailboxId?: string;
	limit?: number;
	offset?: number;
	folder?: "inbox" | "archive" | "trash";
	q?: string;
	isPinned?: boolean;
	filter?: "primary" | "alerts" | "person" | "tag";
};

export type UpdateInboxMessageInput = {
	isRead?: boolean;
	isStarred?: boolean;
	isSpam?: boolean;
};

export type UpdateInboxThreadInput = {
	isRead?: boolean;
	isStarred?: boolean;
	isImportant?: boolean;
	isPinned?: boolean;
	status?: InboxThreadStatus;
};

/** Received mail, conversation threads, and sends from an inbox mailbox. */
export class InboxApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	listMailboxes(): Promise<Mailbox[]> {
		return this.#client.request<Mailbox[]>({
			method: "GET",
			path: inboxEndpoints.mailboxes,
			codes: MAILBOX_CODES,
			idempotent: true,
		});
	}

	retrieveMailbox(id: string): Promise<Mailbox> {
		return this.#client.request<Mailbox>({
			method: "GET",
			path: inboxEndpoints.mailbox(id),
			codes: MAILBOX_CODES,
			idempotent: true,
		});
	}

	listMessages(query: ListInboxMessagesQuery = {}): Promise<InboxMessage[]> {
		return this.#client.request<InboxMessage[]>({
			method: "GET",
			path: inboxEndpoints.messages,
			query: {
				mailboxId: query.mailboxId,
				limit: query.limit,
				offset: query.offset,
				q: query.q,
				isSpam: query.isSpam,
			},
			codes: MESSAGE_CODES,
			idempotent: true,
		});
	}

	listSentMessages(
		query: { mailboxId?: string; q?: string } = {},
	): Promise<MailboxSentMessage[]> {
		return this.#client.request<MailboxSentMessage[]>({
			method: "GET",
			path: inboxEndpoints.sentMessages,
			query: { mailboxId: query.mailboxId, q: query.q },
			codes: MESSAGE_CODES,
			idempotent: true,
		});
	}

	retrieveMessage(id: string): Promise<InboxMessage> {
		return this.#client.request<InboxMessage>({
			method: "GET",
			path: inboxEndpoints.message(id),
			codes: MESSAGE_CODES,
			idempotent: true,
		});
	}

	updateMessage(
		id: string,
		input: UpdateInboxMessageInput,
	): Promise<InboxActionResponse> {
		return this.#client.request<InboxActionResponse>({
			method: "PATCH",
			path: inboxEndpoints.message(id),
			body: input,
			codes: MESSAGE_CODES,
			idempotent: true,
		});
	}

	removeMessage(id: string): Promise<InboxActionResponse> {
		return this.#client.request<InboxActionResponse>({
			method: "DELETE",
			path: inboxEndpoints.message(id),
			codes: MESSAGE_CODES,
			idempotent: true,
		});
	}

	send(input: MailboxSendInput): Promise<InboxSendResponse> {
		return this.#client.request<InboxSendResponse>({
			method: "POST",
			path: inboxEndpoints.send,
			body: input,
			codes: MAILBOX_CODES,
			idempotent: false,
		});
	}

	reply(
		id: string,
		input: InboxReplyInput,
		options: { all: boolean },
	): Promise<InboxSendResponse> {
		return this.#client.request<InboxSendResponse>({
			method: "POST",
			path: options.all
				? inboxEndpoints.replyAll(id)
				: inboxEndpoints.reply(id),
			body: input,
			codes: MESSAGE_CODES,
			idempotent: false,
		});
	}

	forward(id: string, input: InboxForwardInput): Promise<InboxSendResponse> {
		return this.#client.request<InboxSendResponse>({
			method: "POST",
			path: inboxEndpoints.forward(id),
			body: input,
			codes: MESSAGE_CODES,
			idempotent: false,
		});
	}

	cancelPending(id: string): Promise<InboxActionResponse> {
		return this.#client.request<InboxActionResponse>({
			method: "POST",
			path: inboxEndpoints.cancelPending(id),
			codes: { 404: "pending_send_not_found" },
			idempotent: true,
		});
	}

	listThreads(query: ListInboxThreadsQuery = {}): Promise<InboxThread[]> {
		return this.#client.request<InboxThread[]>({
			method: "GET",
			path: inboxEndpoints.threads,
			query: {
				mailboxId: query.mailboxId,
				limit: query.limit,
				offset: query.offset,
				folder: query.folder,
				q: query.q,
				isPinned: query.isPinned,
				filter: query.filter,
			},
			codes: THREAD_CODES,
			idempotent: true,
		});
	}

	retrieveThread(id: string): Promise<InboxThreadDetail> {
		return this.#client.request<InboxThreadDetail>({
			method: "GET",
			path: inboxEndpoints.thread(id),
			codes: THREAD_CODES,
			idempotent: true,
		});
	}

	updateThread(
		id: string,
		input: UpdateInboxThreadInput,
	): Promise<InboxActionResponse> {
		return this.#client.request<InboxActionResponse>({
			method: "PATCH",
			path: inboxEndpoints.thread(id),
			body: input,
			codes: THREAD_CODES,
			idempotent: true,
		});
	}

	moveThread(
		id: string,
		action: "archive" | "trash" | "restore",
	): Promise<InboxActionResponse> {
		return this.#client.request<InboxActionResponse>({
			method: "POST",
			path: inboxEndpoints.threadAction(id, action),
			codes: THREAD_CODES,
			idempotent: true,
		});
	}

	removeThread(id: string): Promise<InboxActionResponse> {
		return this.#client.request<InboxActionResponse>({
			method: "DELETE",
			path: inboxEndpoints.thread(id),
			codes: THREAD_CODES,
			idempotent: true,
		});
	}
}
