import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { domainEndpoints } from "./endpoints";
import type {
	CreateDomainInput,
	Domain,
	DomainListResponse,
	DomainSettingsInput,
	ListDomainsQuery,
	VerifyDomainResponse,
} from "./types";

const DOMAIN_CODES: ErrorCodeMap = {
	404: "domain_not_found",
	409: "domain_already_exists",
};

export class DomainsApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(query: ListDomainsQuery = {}): Promise<DomainListResponse> {
		return this.#client.request<DomainListResponse>({
			method: "GET",
			path: domainEndpoints.list,
			query: {
				page: query.page,
				limit: query.limit,
				q: query.q,
				status: query.status,
			},
			codes: DOMAIN_CODES,
			idempotent: true,
		});
	}

	retrieve(id: string): Promise<Domain> {
		return this.#client.request<Domain>({
			method: "GET",
			path: domainEndpoints.byId(id),
			codes: DOMAIN_CODES,
			idempotent: true,
		});
	}

	create(input: CreateDomainInput): Promise<Domain> {
		return this.#client.request<Domain>({
			method: "POST",
			path: domainEndpoints.create,
			body: input,
			codes: DOMAIN_CODES,
			idempotent: false,
		});
	}

	update(id: string, input: DomainSettingsInput): Promise<Domain> {
		return this.#client.request<Domain>({
			method: "PATCH",
			path: domainEndpoints.byId(id),
			body: input,
			codes: DOMAIN_CODES,
			idempotent: true,
		});
	}

	verify(id: string): Promise<VerifyDomainResponse> {
		return this.#client.request<VerifyDomainResponse>({
			method: "POST",
			path: domainEndpoints.verify(id),
			codes: DOMAIN_CODES,
			idempotent: true,
		});
	}

	remove(id: string): Promise<Domain> {
		return this.#client.request<Domain>({
			method: "DELETE",
			path: domainEndpoints.byId(id),
			codes: DOMAIN_CODES,
			idempotent: true,
		});
	}
}
