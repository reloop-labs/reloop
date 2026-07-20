import { emailConfig } from "@reloop/email/email.config";
import { log } from "evlog";
import nodemailer from "nodemailer";
import { Reloop } from "reloop-email";

const isProduction =
	emailConfig.RELOOP_API_KEY && emailConfig.RELOOP_SENDER_DOMAIN;

let reloop: Reloop | null = null;
if (isProduction) {
	reloop = new Reloop({
		apiKey: emailConfig.RELOOP_API_KEY,
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
	html: string;
	text?: string;
}

export async function sendEmail(options: SendEmailOptions) {
	try {
		if (isProduction && reloop) {
			log.info({
				...{ to: options.to, subject: options.subject },
				message: "Sending email via Reloop SDK",
			});
			const { response, emailError } = await reloop.mail.send({
				from: options.from,
				to: Array.isArray(options.to) ? options.to : [options.to],
				subject: options.subject,
				html: options.html,
				text: options.text,
			});

			if (emailError) {
				throw emailError;
			}

			return response;
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
