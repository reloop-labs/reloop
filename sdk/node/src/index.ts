import { HTTPClient, type ReloopConfig } from "./client.js";
import { MailService } from "./services/mail.js";
import { ApiKeyService } from "./services/apiKey.js";

export class Reloop {
	public readonly mail: MailService;
	public readonly apiKey: ApiKeyService;

	/**
	 * Create a new Reloop SDK client
	 * @param config Configuration object with url and key
	 */
	constructor(config: ReloopConfig) {
		const client = new HTTPClient(config);

		this.mail = new MailService(client);
		this.apiKey = new ApiKeyService(client);
	}
}

export default Reloop;

export type { ReloopConfig } from "./client.js";
export * from "./errors.js";
// Export types
export * from "./types.js";
