import { logger } from "@reloop/logger";
import nodemailer from "nodemailer";

interface TestPostfixSendResponse {
	success: boolean;
	messageId?: string;
	response?: string;
	timestamp: string;
	config: {
		from: string;
		to: string;
		subject: string;
	};
	error?: string;
}

export async function testPostfixSend(): Promise<TestPostfixSendResponse> {
	const timestamp = new Date().toISOString();

	const TEST_CONFIG = {
		from: "test@deployx.dev",
		to: "jxgyc.test@inbox.testmail.app",
		subject: "Postfix Health Check",
		text: `Postfix test email sent at ${timestamp}.\n\nIf you receive this, the mail server is operational.`,
	};

	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST || "localhost",
		port: Number.parseInt(process.env.SMTP_PORT || "587"),
		secure: false,
		tls: {
			rejectUnauthorized: false,
		},
	});

	try {
		logger.info(
			{
				from: TEST_CONFIG.from,
				to: TEST_CONFIG.to,
				host: process.env.SMTP_HOST || "localhost",
				port: process.env.SMTP_PORT || "587",
			},
			"Starting Postfix test email send",
		);

		const info = await transporter.sendMail({
			from: TEST_CONFIG.from,
			to: TEST_CONFIG.to,
			subject: TEST_CONFIG.subject,
			text: TEST_CONFIG.text,
		});

		logger.info(
			{
				messageId: info.messageId,
				response: info.response,
			},
			"Postfix test email sent successfully",
		);

		return {
			success: true,
			messageId: info.messageId,
			response: info.response || "Email sent successfully",
			timestamp,
			config: {
				from: TEST_CONFIG.from,
				to: TEST_CONFIG.to,
				subject: TEST_CONFIG.subject,
			},
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		logger.error(
			{
				error: errorMessage,
				from: TEST_CONFIG.from,
				to: TEST_CONFIG.to,
			},
			"Postfix test email failed",
		);

		return {
			success: false,
			timestamp,
			config: {
				from: TEST_CONFIG.from,
				to: TEST_CONFIG.to,
				subject: TEST_CONFIG.subject,
			},
			error: errorMessage,
		};
	}
}
