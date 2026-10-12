import type { ReloopClient } from "./client";
import { domainAgeEndpoints } from "./endpoints";
import type { DomainAgeReport } from "./types";

export class DomainAgeApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	check(domain: string): Promise<DomainAgeReport> {
		return this.#client.request<DomainAgeReport>({
			method: "POST",
			path: domainAgeEndpoints.check,
			body: { domain },
			idempotent: true,
		});
	}
}
