import { emailConfig } from "@reloop/email/email.config";
import { log } from "evlog";
import nodemailer from "nodemailer";
import { Reloop } from "reloop-email";

function createReloopClient(apiKey: string): Reloop {
	return new Reloop({
		apiKey,
		baseUrl: emailConfig.BASE_URL,
	});
}

const transporter = nodemailer.createTransport({
	host: "localhost",
	port: 1025,
});

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
 * Send via reloop-email when RELOOP_API_KEY is set;
 * otherwise fall back to local SMTP (Mailpit) for development.
 */
export async function sendEmail(options: SendEmailOptions) {
	const apiKey =
		options.apiKey?.trim() || emailConfig.RELOOP_API_KEY?.trim() || "";
	const client = apiKey ? createReloopClient(apiKey) : null;

	try {
		if (client) {
			log.info({
				...{ to: options.to, subject: options.subject },
				message: "Sending email via Reloop SDK",
			});
			// reloop-email throws on non-OK responses; success returns the API JSON body.
			return await client.mail.send({
				from: options.from,
				to: Array.isArray(options.to) ? options.to : [options.to],
				subject: options.subject,
				html: options.html,
				text: options.text,
			});
		}

		log.info({
			...{ to: options.to, subject: options.subject },
			message: "Sending email via SMTP (Mailpit)",
		});
		const info = await transporter.sendMail({
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
