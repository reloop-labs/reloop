import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { channelEndpoints, contactEndpoints } from "./endpoints";
import type {
	Channel,
	ChannelListResponse,
	ChannelSubscriptionInput,
	ChannelSubscriptionResponse,
	CreateChannelInput,
	DeleteResourceResponse,
	ListChannelsQuery,
	UpdateChannelInput,
} from "./types";

const CHANNEL_CODES: ErrorCodeMap = {
	404: "channel_not_found",
	409: "channel_already_exists",
};

export class ChannelsApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(query: ListChannelsQuery = {}): Promise<ChannelListResponse> {
		return this.#client.request<ChannelListResponse>({
			method: "GET",
			path: channelEndpoints.list,
			query: { page: query.page, limit: query.limit },
			codes: CHANNEL_CODES,
			idempotent: true,
		});
	}

	retrieve(id: string): Promise<Channel> {
		return this.#client.request<Channel>({
			method: "GET",
			path: channelEndpoints.byId(id),
			codes: CHANNEL_CODES,
			idempotent: true,
		});
	}

	create(input: CreateChannelInput): Promise<Channel> {
		return this.#client.request<Channel>({
			method: "POST",
			path: channelEndpoints.create,
			body: input,
			codes: CHANNEL_CODES,
			idempotent: false,
		});
	}

	update(id: string, input: UpdateChannelInput): Promise<Channel> {
		return this.#client.request<Channel>({
			method: "PATCH",
			path: channelEndpoints.byId(id),
			body: input,
			codes: CHANNEL_CODES,
			idempotent: true,
		});
	}

	remove(id: string): Promise<DeleteResourceResponse> {
		return this.#client.request<DeleteResourceResponse>({
			method: "DELETE",
			path: channelEndpoints.byId(id),
			codes: CHANNEL_CODES,
			idempotent: true,
		});
	}

	setSubscription(
		id: string,
		input: ChannelSubscriptionInput,
	): Promise<ChannelSubscriptionResponse> {
		return this.#client.request<ChannelSubscriptionResponse>({
			method: "PATCH",
			path: contactEndpoints.channelSubscription(id),
			body: input,
			idempotent: true,
		});
	}
}
