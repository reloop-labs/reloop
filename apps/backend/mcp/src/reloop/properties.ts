import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { propertyEndpoints } from "./endpoints";
import type {
	ContactProperty,
	CreatePropertyInput,
	DeleteResourceResponse,
	ListPropertiesQuery,
	PropertyListResponse,
} from "./types";

const PROPERTY_CODES: ErrorCodeMap = {
	404: "property_not_found",
	409: "property_already_exists",
};

export class PropertiesApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(query: ListPropertiesQuery = {}): Promise<PropertyListResponse> {
		return this.#client.request<PropertyListResponse>({
			method: "GET",
			path: propertyEndpoints.list,
			query: {
				page: query.page,
				limit: query.limit,
				search: query.search,
				type: query.type,
			},
			codes: PROPERTY_CODES,
			idempotent: true,
		});
	}

	create(input: CreatePropertyInput): Promise<ContactProperty> {
		return this.#client.request<ContactProperty>({
			method: "POST",
			path: propertyEndpoints.create,
			body: input,
			codes: PROPERTY_CODES,
			idempotent: false,
		});
	}

	setFallback(
		id: string,
		fallbackValue: string | null,
	): Promise<ContactProperty> {
		return this.#client.request<ContactProperty>({
			method: "PATCH",
			path: propertyEndpoints.byId(id),
			body: { fallbackValue },
			codes: PROPERTY_CODES,
			idempotent: true,
		});
	}

	remove(id: string): Promise<DeleteResourceResponse> {
		return this.#client.request<DeleteResourceResponse>({
			method: "DELETE",
			path: propertyEndpoints.byId(id),
			codes: PROPERTY_CODES,
			idempotent: true,
		});
	}
}
