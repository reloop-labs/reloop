import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { contactEndpoints, groupEndpoints } from "./endpoints";
import type {
	ContactSelector,
	DeleteResourceResponse,
	Group,
	GroupContactListResponse,
	GroupListResponse,
	GroupMembershipResponse,
	ListGroupContactsQuery,
	ListGroupsQuery,
} from "./types";

const GROUP_CODES: ErrorCodeMap = {
	404: "group_not_found",
	409: "group_already_exists",
};

export class GroupsApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(query: ListGroupsQuery = {}): Promise<GroupListResponse> {
		return this.#client.request<GroupListResponse>({
			method: "GET",
			path: groupEndpoints.list,
			query: { page: query.page, limit: query.limit, search: query.search },
			codes: GROUP_CODES,
			idempotent: true,
		});
	}

	retrieve(id: string): Promise<Group> {
		return this.#client.request<Group>({
			method: "GET",
			path: groupEndpoints.byId(id),
			codes: GROUP_CODES,
			idempotent: true,
		});
	}

	create(name: string): Promise<Group> {
		return this.#client.request<Group>({
			method: "POST",
			path: groupEndpoints.create,
			body: { name },
			codes: GROUP_CODES,
			idempotent: false,
		});
	}

	rename(id: string, name: string): Promise<Group> {
		return this.#client.request<Group>({
			method: "PATCH",
			path: groupEndpoints.byId(id),
			body: { name },
			codes: GROUP_CODES,
			idempotent: true,
		});
	}

	remove(id: string): Promise<DeleteResourceResponse> {
		return this.#client.request<DeleteResourceResponse>({
			method: "DELETE",
			path: groupEndpoints.byId(id),
			codes: GROUP_CODES,
			idempotent: true,
		});
	}

	listContacts(
		id: string,
		query: ListGroupContactsQuery = {},
	): Promise<GroupContactListResponse> {
		return this.#client.request<GroupContactListResponse>({
			method: "GET",
			path: groupEndpoints.contacts(id),
			query: {
				page: query.page,
				limit: query.limit,
				search: query.search,
				status: query.status,
			},
			codes: GROUP_CODES,
			idempotent: true,
		});
	}

	addContact(
		id: string,
		contact: ContactSelector,
	): Promise<GroupMembershipResponse> {
		return this.#client.request<GroupMembershipResponse>({
			method: "POST",
			path: contactEndpoints.groupMembership(id),
			body: contact,
			idempotent: true,
		});
	}

	removeContact(
		id: string,
		contact: ContactSelector,
	): Promise<GroupMembershipResponse> {
		return this.#client.request<GroupMembershipResponse>({
			method: "DELETE",
			path: contactEndpoints.groupMembership(id),
			body: contact,
			idempotent: true,
		});
	}
}
