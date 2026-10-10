import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { contactEndpoints } from "./endpoints";
import type {
	Contact,
	ContactListResponse,
	CreateContactInput,
	DeleteContactResponse,
	ListContactsQuery,
	MutatedContact,
	UpdateContactInput,
} from "./types";

export const MAX_PAGE_SIZE = 100;

const CONTACT_CODES: ErrorCodeMap = {
	404: "contact_not_found",
	409: "contact_already_exists",
};

export class ContactsApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(query: ListContactsQuery = {}): Promise<ContactListResponse> {
		return this.#client.request<ContactListResponse>({
			method: "GET",
			path: contactEndpoints.list,
			query: {
				page: query.page,
				limit: query.limit,
				search: query.search,
				status: query.status,
				channelId: query.channelId,
			},
			codes: CONTACT_CODES,
			idempotent: true,
		});
	}

	retrieve(id: string): Promise<Contact> {
		return this.#client.request<Contact>({
			method: "GET",
			path: contactEndpoints.retrieve(id),
			codes: CONTACT_CODES,
			idempotent: true,
		});
	}

	create(input: CreateContactInput): Promise<MutatedContact> {
		return this.#client.request<MutatedContact>({
			method: "POST",
			path: contactEndpoints.create,
			body: input,
			codes: CONTACT_CODES,
			idempotent: false,
		});
	}

	update(id: string, input: UpdateContactInput): Promise<MutatedContact> {
		return this.#client.request<MutatedContact>({
			method: "PATCH",
			path: contactEndpoints.byId(id),
			body: input,
			codes: CONTACT_CODES,
			idempotent: true,
		});
	}

	remove(id: string): Promise<DeleteContactResponse> {
		return this.#client.request<DeleteContactResponse>({
			method: "DELETE",
			path: contactEndpoints.byId(id),
			codes: CONTACT_CODES,
			idempotent: true,
		});
	}

	async findByEmail(email: string): Promise<Contact | undefined> {
		const needle = email.trim().toLowerCase();
		const response = await this.list({ search: needle, limit: MAX_PAGE_SIZE });
		return response.contacts.find(
			(contact) => contact.email.toLowerCase() === needle,
		);
	}
}
