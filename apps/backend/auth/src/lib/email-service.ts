import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	from?: string;
}

export const sendEmail = async ({ to, subject, html, from }: EmailOptions) => {
	try {
		const { data, error } = await resend.emails.send({
			from:
				from ||
				`Reloop <noreply@${process.env.EMAIL_DOMAIN || "reloop.local"}>`,
			to: [to],
			subject,
			html,
		});

		if (error) {
			console.error("Failed to send email:", error);
			throw new Error(`Failed to send email: ${error.message}`);
		}

		console.log("Email sent successfully:", data);
		return data;
	} catch (error) {
		console.error("Email service error:", error);
		throw error;
	}
};

export const sendPasswordResetEmail = async (
	email: string,
	resetUrl: string,
) => {
	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Reset Your Password</title>
			<style>
				body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
				.logo { font-size: 24px; font-weight: bold; color: #2563eb; }
				.content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
				.button { display: inline-block; background: #f8f9fa; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
				.button:hover { background: #1d4ed8; color: white; }
				.footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
			</style>
		</head>
		<body>
			<div class="header">
				<div class="logo">Reloop</div>
			</div>
			<div class="content">
				<h2>Reset Your Password</h2>
				<p>Hello,</p>
				<p>We received a request to reset your password for your Reloop account. If you made this request, click the button below to reset your password:</p>
				<div style="text-align: center;">
					<a href="${resetUrl}" class="button">Reset Password</a>
				</div>
				<p>If the button doesn't work, you can copy and paste this link into your browser:</p>
				<p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
				<p><strong>This link will expire in 1 hour for security reasons.</strong></p>
				<p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
			</div>
			<div class="footer">
				<p>This email was sent from Reloop. If you have any questions, please contact our support team.</p>
				<p>&copy; 2024 Reloop. All rights reserved.</p>
			</div>
		</body>
		</html>
	`;

	return sendEmail({
		to: email,
		subject: "Reset Your Reloop Password",
		html,
	});
};
