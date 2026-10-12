import type { ReloopClient } from "./client";
import { tempEmailEndpoints } from "./endpoints";
import type { TempEmailCheck } from "./types";

export class TempEmailApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	check(email: string): Promise<TempEmailCheck> {
		return this.#client.request<TempEmailCheck>({
			method: "POST",
			path: tempEmailEndpoints.check,
			body: { email },
			idempotent: true,
		});
	}
}
