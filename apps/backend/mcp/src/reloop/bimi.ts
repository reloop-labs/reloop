import type { ReloopClient } from "./client";
import { bimiEndpoints } from "./endpoints";
import type { BimiCheckReport } from "./types";

export class BimiApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	check(domain: string): Promise<BimiCheckReport> {
		return this.#client.request<BimiCheckReport>({
			method: "POST",
			path: bimiEndpoints.check,
			body: { domain },
			idempotent: true,
		});
	}
}
