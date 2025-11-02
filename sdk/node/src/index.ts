import { HTTPClient, type ReloopConfig } from "./client.js";
import { AudienceService } from "./services/audience.js";
import { DomainService } from "./services/domain.js";
import { MailService } from "./services/mail.js";
import { WebhookService } from "./services/webhook.js";

/**
 * Reloop SDK Client
 *
 * @example
 * ```typescript
 * import Reloop from 'reloop-email';
 *
 * const reloop = new Reloop({
 *   url: 'https://api.reloop.sh',
 *   key: 'your-api-key'
 * });
 *
 * // Send an email
 * const result = await reloop.mail.send({
 *   from: 'sender@example.com',
 *   to: 'recipient@example.com',
 *   subject: 'Hello',
 *   text: 'Hello World!'
 * });
 * ```
 */
export class Reloop {
	public readonly mail: MailService;
	public readonly domain: DomainService;
	public readonly webhook: WebhookService;
	public readonly audience: AudienceService;

	/**
	 * Create a new Reloop SDK client
	 * @param config Configuration object with url and key
	 */
	constructor(config: ReloopConfig) {
		const client = new HTTPClient(config);

		this.mail = new MailService(client);
		this.domain = new DomainService(client);
		this.webhook = new WebhookService(client);
		this.audience = new AudienceService(client);
	}
}

export default Reloop;

export type { ReloopConfig } from "./client.js";
export * from "./errors.js";
// Export types
export * from "./types.js";
