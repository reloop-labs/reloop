import { logger } from "@reloop/logger";
import { mailConfig } from "../mail.config";

export interface KumomtaHttpConfig {
	baseUrl: string;
}

export interface SendEmailOptions {
	from: string;
	fromName?: string;
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	replyTo?: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	customHeaders?: Record<string, string>;
	scheduledAt?: string;
	topicId?: string;
	attachments?: Array<{
		content?: string | Buffer | import("stream").Readable;
		filename?: string;
		path?: string;
		contentType?: string;
		contentId?: string;
	}>;
	tags?: Array<{ name: string; value: string }>;
	template?: { id: string; variables?: Record<string, string | number> };
}

interface InjectRecipient {
	email: string;
}

interface InjectRequest {
	envelope_sender: string;
	recipients: InjectRecipient[];
	content: string;
}

export class KumomtaClient {
	private baseUrl: string;

	constructor(config: KumomtaHttpConfig) {
		this.baseUrl = config.baseUrl.replace(/\/+$/, "");
	}

	async testConnection(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/api/check-liveness/v1`, {
				method: "GET",
				signal: AbortSignal.timeout(5000),
			});
			const isAlive = response.ok;
			logger.info(
				{ baseUrl: this.baseUrl, status: response.status },
				isAlive
					? "KumoMTA HTTP connection verified"
					: "KumoMTA HTTP connection check failed",
			);
			return isAlive;
		} catch (error) {
			logger.error(
				{
					error: error instanceof Error ? error.message : String(error),
					baseUrl: this.baseUrl,
				},
				"KumoMTA HTTP connection failed",
			);
			return false;
		}
	}

	async sendEmail(
		options: SendEmailOptions,
	): Promise<{ id: string; messageId: string }> {
		const toList = Array.isArray(options.to) ? options.to : [options.to];
		const content = await buildRfcMessage(options);

		// Deduplicate recipients across To, CC, and BCC to avoid multiple deliveries to the same address
		const recipientSet = new Set<string>();

		toList.forEach((email) => {
			recipientSet.add(email.toLowerCase().trim());
		});

		if (options.cc) {
			const ccList = Array.isArray(options.cc) ? options.cc : [options.cc];
			ccList.forEach((email) => {
				recipientSet.add(email.toLowerCase().trim());
			});
		}

		if (options.bcc) {
			const bccList = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
			bccList.forEach((email) => {
				recipientSet.add(email.toLowerCase().trim());
			});
		}

		const payload: InjectRequest = {
			envelope_sender: options.from,
			recipients: Array.from(recipientSet).map((email) => ({ email })),
			content,
		};

		try {
			const response = await fetch(`${this.baseUrl}/api/inject/v1`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorBody = await response.text();
				throw new Error(
					`KumoMTA injection failed (${response.status}): ${errorBody}`,
				);
			}

			const result = await response.json();

			logger.info(
				{
					id: result.id,
					from: options.from,
					to: options.to,
					subject: options.subject,
				},
				"Email injected via KumoMTA HTTP API",
			);

			return {
				id: result.id || "",
				messageId: result.id || "",
			};
		} catch (error) {
			logger.error(
				{
					error: error instanceof Error ? error.message : String(error),
					from: options.from,
					to: options.to,
					subject: options.subject,
				},
				"Failed to inject email via KumoMTA HTTP API",
			);
			throw error;
		}
	}

	getConfig(): KumomtaHttpConfig {
		return { baseUrl: this.baseUrl };
	}
}

import MailComposer from "nodemailer/lib/mail-composer";

/**
 * Build an RFC 5322 formatted message string with headers and body.
 */
async function buildRfcMessage(options: SendEmailOptions): Promise<string> {
	const emailLogId = options.customHeaders?.["X-Email-Log-ID"];
	const trackingBaseUrl = mailConfig.BASE_URL.replace(/\/+$/, "");
	let html = options.html;

	if (emailLogId && html) {
		// 1. Inject open tracking pixel
		const pixel = `<img src="${trackingBaseUrl}/api/mail/v1/track/open/${emailLogId}" width="1" height="1" style="display:none" alt="" />`;
		if (html.includes("</body>")) {
			html = html.replace("</body>", `${pixel}</body>`);
		} else {
			html += pixel;
		}

		// 2. Rewrite links for click tracking
		// Search for <a ... href="URL" ...> and replace URL
		html = html.replace(
			/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi,
			(match, _quote, url) => {
				// Avoid rewriting existing tracking links or anchored links
				if (url.startsWith("#") || url.includes("/api/mail/v1/track/click")) {
					return match;
				}
				const trackedUrl = `${trackingBaseUrl}/api/mail/v1/track/click/${emailLogId}?url=${encodeURIComponent(url)}`;
				return match.replace(url, trackedUrl);
			},
		);
	}

	const mailOptions: import("nodemailer/lib/mailer").Options = {
		from: options.fromName
			? `${options.fromName} <${options.from}>`
			: options.from,
		to: options.to,
		subject: options.subject,
		text: options.text,
		html: html,
		replyTo: options.replyTo,
		cc: options.cc,
		bcc: options.bcc,
		headers: options.customHeaders,
		attachments: options.attachments?.map((att) => ({
			filename: att.filename,
			content: att.content,
			path: att.path,
			contentType: att.contentType,
			cid: att.contentId,
		})),
	};

	const composer = new MailComposer(mailOptions);
	const message = await composer.compile().build();

	return message.toString();
}

// Create singleton instance
const kumomtaUrl = mailConfig.KUMOMTA_HTTP_URL;
export const kumomtaClient = new KumomtaClient({
	baseUrl: kumomtaUrl,
});
