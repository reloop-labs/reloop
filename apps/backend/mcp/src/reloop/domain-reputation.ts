import type { ReloopClient } from "./client";
import { domainReputationEndpoints } from "./endpoints";
import type { DomainReputationReport } from "./types";

export class DomainReputationApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	check(domain: string): Promise<DomainReputationReport> {
		return this.#client.request<DomainReputationReport>({
			method: "POST",
			path: domainReputationEndpoints.check,
			body: { domain },
			idempotent: true,
		});
	}
}
