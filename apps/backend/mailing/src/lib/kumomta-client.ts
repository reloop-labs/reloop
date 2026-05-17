import { log } from "evlog";
import MailComposer from "nodemailer/lib/mail-composer";
import { mailConfig } from "../mail.config";
import { MailErrors } from "./errors";

export interface KumomtaHttpConfig {
	baseUrl: string;
	timeoutMs?: number;
}

export interface SendEmailOptions {
	from: string;
	fromName?: string;
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	reply_to?: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	customHeaders?: Record<string, string>;
	scheduled_at?: string;
	channel_id?: string;
	attachments?: Array<{
		content?: string | Buffer | import("stream").Readable;
		filename?: string;
		path?: string;
		content_type?: string;
		content_id?: string;
	}>;
	tags?: Array<{ name: string; value: string }>;
	template?: { id: string; variables?: Record<string, string | number> };
}

// KumoMTA /api/inject/v1 response shape (per official API schema)
interface InjectResponse {
	success_count: number;
	fail_count: number;
	failed_recipients: string[]; // array of email addresses that failed
	errors: string[];
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
	private timeoutMs: number;

	constructor(config: KumomtaHttpConfig) {
		this.baseUrl = config.baseUrl.replace(/\/+$/, "");
		this.timeoutMs = config.timeoutMs ?? 30_000;
	}

	async testConnection(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/api/check-liveness/v1`, {
				method: "GET",
				signal: AbortSignal.timeout(5000),
			});
			const isAlive = response.ok;
			log.info({
				message: isAlive
					? "KumoMTA HTTP connection verified"
					: "KumoMTA HTTP connection check failed",
				baseUrl: this.baseUrl,
				status: response.status,
			});
			return isAlive;
		} catch (error) {
			log.error({
				message: "KumoMTA HTTP connection failed",
				error: error instanceof Error ? error.message : String(error),
				baseUrl: this.baseUrl,
			});
			return false;
		}
	}

	async sendEmail(
		options: SendEmailOptions,
	): Promise<{ id: string; messageId: string }> {
		const toList = Array.isArray(options.to) ? options.to : [options.to];
		const content = await buildRfcMessage(options);

		// Deduplicate recipients across To, CC, and BCC to avoid multiple
		// deliveries to the same address
		const recipientSet = new Set<string>();

		for (const email of toList) {
			recipientSet.add(email.toLowerCase().trim());
		}

		if (options.cc) {
			const ccList = Array.isArray(options.cc) ? options.cc : [options.cc];
			for (const email of ccList) {
				recipientSet.add(email.toLowerCase().trim());
			}
		}

		if (options.bcc) {
			const bccList = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
			for (const email of bccList) {
				recipientSet.add(email.toLowerCase().trim());
			}
		}

		const payload: InjectRequest = {
			envelope_sender: options.from,
			recipients: Array.from(recipientSet).map((email) => ({ email })),
			content,
		};

		let response: Response;
		try {
			response = await fetch(`${this.baseUrl}/api/inject/v1`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				signal: AbortSignal.timeout(this.timeoutMs),
			});
		} catch (error) {
			log.error({
				message: "Failed to reach KumoMTA HTTP API",
				error: error instanceof Error ? error.message : String(error),
				from: options.from,
				to: options.to,
			});
			throw error;
		}

		if (response.status === 422) {
			const errorBody = await response
				.text()
				.catch(() => "422 Unprocessable Entity");
			log.error({
				message: "KumoMTA rejected message: content syntax error (422)",
				body: errorBody,
				from: options.from,
				to: options.to,
			});
			throw MailErrors.kumoMtaError(
				422,
				`Invalid message content: ${errorBody}`,
			);
		}

		if (!response.ok) {
			const errorBody = await response
				.text()
				.catch(() => `HTTP ${response.status}`);
			log.error({
				message: "KumoMTA HTTP API returned non-2xx",
				status: response.status,
				body: errorBody,
				from: options.from,
				to: options.to,
			});
			throw MailErrors.kumoMtaError(response.status, errorBody);
		}

		const result: InjectResponse = await response.json();

		// Surface partial failures — KumoMTA returns 200 even when some
		// recipients were rejected.
		if (result.fail_count > 0 || result.errors.length > 0) {
			const reason =
				[
					...result.failed_recipients.map((email) => `failed: ${email}`),
					...result.errors,
				].join("; ") || "unknown injection failure";
			log.error({
				message: "KumoMTA injection had failures",
				fail_count: result.fail_count,
				failed_recipients: result.failed_recipients,
				errors: result.errors,
				from: options.from,
				to: options.to,
			});
			throw MailErrors.kumoMtaError(200, reason);
		}

		// KumoMTA inject/v1 does not return a per-message ID in its response.
		// We use the X-Email-Log-ID custom header value we injected as the stable
		// message identifier that ties the inject call back to our emailLog row.
		const messageId = options.customHeaders?.["X-Email-Log-ID"] ?? "";

		log.info({
			message: "Email injected via KumoMTA HTTP API",
			messageId,
			from: options.from,
			to: options.to,
			subject: options.subject,
			success_count: result.success_count,
		});

		return { id: messageId, messageId };
	}

	getConfig(): KumomtaHttpConfig {
		return { baseUrl: this.baseUrl };
	}
}

/**
 * Build an RFC 5322 formatted message string with headers and body.
 * Tracking injection is handled upstream in step-5b — this function
 * only handles MIME composition.
 */
async function buildRfcMessage(options: SendEmailOptions): Promise<string> {
	const mailOptions: import("nodemailer/lib/mailer").Options = {
		from: options.fromName
			? `${options.fromName} <${options.from}>`
			: options.from,
		to: options.to,
		subject: options.subject,
		text: options.text,
		html: options.html,
		replyTo: options.reply_to,
		cc: options.cc,
		bcc: options.bcc,
		headers: options.customHeaders,
		attachments: options.attachments?.map((att) => ({
			filename: att.filename,
			content: att.content,
			path: att.path,
			contentType: att.content_type,
			cid: att.content_id,
		})),
	};

	const composer = new MailComposer(mailOptions);
	const message = await composer.compile().build();
	return message.toString();
}

export const kumomtaClient = new KumomtaClient({
	baseUrl: mailConfig.KUMOMTA_HTTP_URL,
});
