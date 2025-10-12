import { render } from "@react-email/render";
import { Resend } from "resend";
import PasswordResetEmail from "./password-reset";

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
	const html = await render(PasswordResetEmail({ resetUrl }));

	return sendEmail({
		to: email,
		subject: "Reset Your Reloop Password",
		html,
	});
};
