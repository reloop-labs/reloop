import type { ReloopClient } from "./client";
import { mailEndpoints } from "./endpoints";
import type { SendEmailInput, SendEmailResponse } from "./types";

export class MailApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	send(input: SendEmailInput): Promise<SendEmailResponse> {
		return this.#client.request<SendEmailResponse>({
			method: "POST",
			path: mailEndpoints.send,
			body: input,
			idempotent: false,
		});
	}
}
