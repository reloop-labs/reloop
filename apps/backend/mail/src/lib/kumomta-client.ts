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
	replyTo?: string;
	cc?: string | string[];
	bcc?: string | string[];
	customHeaders?: Record<string, string>;
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
		const content = buildRfcMessage(options);

		const payload: InjectRequest = {
			envelope_sender: options.from,
			recipients: toList.map((email) => ({ email })),
			content,
		};

		// Add CC recipients
		if (options.cc) {
			const ccList = Array.isArray(options.cc) ? options.cc : [options.cc];
			for (const email of ccList) {
				payload.recipients.push({ email });
			}
		}

		// Add BCC recipients
		if (options.bcc) {
			const bccList = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
			for (const email of bccList) {
				payload.recipients.push({ email });
			}
		}

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

/**
 * Build an RFC 5322 formatted message string with headers and body.
 */
function buildRfcMessage(options: SendEmailOptions): string {
	const lines: string[] = [];
	const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;

	// Required headers
	lines.push(
		`From: ${options.fromName ? `${options.fromName} <${options.from}>` : options.from}`,
	);

	const toList = Array.isArray(options.to) ? options.to : [options.to];
	lines.push(`To: ${toList.join(", ")}`);
	lines.push(`Subject: ${options.subject}`);
	lines.push(`Date: ${new Date().toUTCString()}`);
	lines.push("MIME-Version: 1.0");

	// Optional headers
	if (options.replyTo) {
		lines.push(`Reply-To: ${options.replyTo}`);
	}
	if (options.cc) {
		const ccList = Array.isArray(options.cc) ? options.cc : [options.cc];
		lines.push(`Cc: ${ccList.join(", ")}`);
	}

	// Custom headers (X-Org-ID, X-Domain-ID, X-Email-Log-ID, etc.)
	if (options.customHeaders) {
		for (const [key, value] of Object.entries(options.customHeaders)) {
			lines.push(`${key}: ${value}`);
		}
	}

	// Body
	if (options.html && options.text) {
		// Multipart alternative
		lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
		lines.push("");
		lines.push(`--${boundary}`);
		lines.push("Content-Type: text/plain; charset=UTF-8");
		lines.push("Content-Transfer-Encoding: quoted-printable");
		lines.push("");
		lines.push(options.text);
		lines.push(`--${boundary}`);
		lines.push("Content-Type: text/html; charset=UTF-8");
		lines.push("Content-Transfer-Encoding: quoted-printable");
		lines.push("");
		lines.push(options.html);
		lines.push(`--${boundary}--`);
	} else if (options.html) {
		lines.push("Content-Type: text/html; charset=UTF-8");
		lines.push("");
		lines.push(options.html);
	} else {
		lines.push("Content-Type: text/plain; charset=UTF-8");
		lines.push("");
		lines.push(options.text || "");
	}

	return lines.join("\r\n");
}

// Create singleton instance
const kumomtaUrl = mailConfig.KUMOMTA_HTTP_URL;

export const kumomtaClient = new KumomtaClient({
	baseUrl: kumomtaUrl,
});
