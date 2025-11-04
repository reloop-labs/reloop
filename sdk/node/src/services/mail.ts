import type { HTTPClient } from "../client.js";
import type { SendEmailRequest, SendEmailResponse } from "../types.js";

export class MailService {
	constructor(private client: HTTPClient) {}

	/**
	 * Send an email
	 * @param data Email data including to, from, subject, and content
	 * @returns Promise resolving to the send email response
	 */
	async send(data: SendEmailRequest): Promise<SendEmailResponse> {
		return this.client.post<SendEmailResponse>("/api/mail/v1/send", data);
	}
}
