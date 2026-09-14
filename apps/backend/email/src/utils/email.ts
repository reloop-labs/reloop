import { emailConfig } from "@reloop/email/email.config";
import {
	describeEmailTransport,
	type EmailTransport,
	resolveEmailTransport,
} from "@reloop/email/utils/email-transport";
import { log } from "evlog";
import nodemailer from "nodemailer";
import { Reloop } from "reloop-email";

function createReloopClient(apiKey: string): Reloop {
	return new Reloop({
		apiKey,
		baseUrl: emailConfig.BASE_URL,
	});
}

const transporters = new Map<string, nodemailer.Transporter>();

function smtpTransporter(
	transport: Extract<EmailTransport, { kind: "smtp" | "mailpit" }>,
): nodemailer.Transporter {
	const key = describeEmailTransport(transport);
	let existing = transporters.get(key);
	if (existing) return existing;

	existing = nodemailer.createTransport(
		transport.kind === "smtp"
			? {
					host: transport.host,
					port: transport.port,
					secure: transport.secure,
					auth: transport.user
						? { user: transport.user, pass: transport.pass }
						: undefined,
				}
			: { host: transport.host, port: transport.port },
	);
	transporters.set(key, existing);
	return existing;
}

export interface SendEmailOptions {
	from: string;
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
	/**
	 * Optional API key override.
	 * Defaults to `RELOOP_API_KEY` (platform org that owns the sender domains).
	 */
	apiKey?: string;
}

/**
 * Send via reloop-email when RELOOP_API_KEY is set, a configured SMTP relay
 * when SMTP_HOST is set, or Mailpit in development. Throws in production when
 * none is configured rather than writing to a Mailpit that is not running.
 */
export async function sendEmail(options: SendEmailOptions) {
	try {
		const transport = resolveEmailTransport(emailConfig, options.apiKey);

		if (transport.kind === "reloop") {
			log.info({
				...{ to: options.to, subject: options.subject },
				message: "Sending email via Reloop SDK",
			});
			// reloop-email throws on non-OK responses; success returns the API JSON body.
			return await createReloopClient(transport.apiKey).mail.send({
				from: options.from,
				to: Array.isArray(options.to) ? options.to : [options.to],
				subject: options.subject,
				html: options.html,
				text: options.text,
			});
		}

		log.info({
			...{
				to: options.to,
				subject: options.subject,
				transport: describeEmailTransport(transport),
			},
			message: "Sending email via SMTP",
		});
		const info = await smtpTransporter(transport).sendMail({
			from: options.from,
			to: options.to,
			subject: options.subject,
			html: options.html,
			text: options.text,
		});

		return info;
	} catch (error) {
		const detail =
			error instanceof Error
				? {
						message: error.message,
						cause:
							error.cause instanceof Error
								? error.cause.message
								: error.cause
									? String(error.cause)
									: undefined,
					}
				: { message: String(error) };
		log.error({
			error: detail.message,
			cause: detail.cause,
			to: options.to,
			from: options.from,
			message: "Failed to send email",
		});
		throw error;
	}
}
