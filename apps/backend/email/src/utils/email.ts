import { emailConfig } from "@reloop/email/email.config";
import { log } from "evlog";
import nodemailer from "nodemailer";
import Reloop from "reloop-email";

const isProduction = emailConfig.NODE_ENV === "production";

let reloop: Reloop | null = null;
if (isProduction && emailConfig.RELOOP_API_KEY) {
	reloop = new Reloop({
		key: emailConfig.RELOOP_API_KEY,
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
			const response = await reloop.mail.send({
				from: options.from,
				to: Array.isArray(options.to) ? options.to : [options.to],
				subject: options.subject,
				html: options.html,
				text: options.text,
			});

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
		log.error({
			error: error instanceof Error ? error.message : String(error),
			to: options.to,
			message: "Failed to send email",
		});
		throw error;
	}
}
