
import { log } from "evlog";
import nodemailer from "nodemailer";
import Reloop from "reloop-email";
import { emailConfig } from "../email.config";

// Check if we are running in production mode
const isProduction = emailConfig.nodeEnv === "production";

// Initialize Reloop SDK only in production if an API key is provided
let reloop: Reloop | null = null;
if (isProduction && emailConfig.RELOOP_API_KEY) {
	reloop = new Reloop({
		key: emailConfig.RELOOP_API_KEY,
	});
}

// SMTP Transporter for local testing (pointing to Mailpit)
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

/**
 * Sends an email using either the Reloop SDK (Production) 
 * or SMTP/Mailpit (Development).
 */
export async function sendEmail(options: SendEmailOptions) {
	try {
		// Use Reloop SDK in Production
		if (isProduction && reloop) {
			log.info({ ...({ to: options.to, subject: options.subject }), message: "Sending email via Reloop SDK" });
			const response = await reloop.mail.send({
				from: options.from,
				to: Array.isArray(options.to) ? options.to : [options.to],
				subject: options.subject,
				html: options.html,
				text: options.text,
			});

			return response;
		}

		// Fallback to SMTP (Mailpit) in Development
		log.info({ ...({ to: options.to, subject: options.subject }), message: "Sending email via SMTP (Mailpit)" });
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
