import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import React from "react";
import { InviteEmail } from "./apps/backend/email/emails/invite";
import { OTPTokenEmail } from "./apps/backend/email/emails/otp";
import { WelcomeEmail } from "./apps/backend/email/emails/welcome";

async function run() {
	const recipient = process.argv[2] || "gogo@local.reloop.sh";
	const baseUrl = "https://local.reloop.sh";

	const transporter = nodemailer.createTransport({
		host: "localhost",
		port: 25,
		secure: false,
		tls: {
			rejectUnauthorized: false,
		},
	});

	// Define multiple email templates and configurations to send
	const emails = [
		{
			name: "OTP Code Email",
			from: `"Reloop Security" <security@local.reloop.sh>`,
			subject: "Your login code for Reloop",
			text: "Your login code for Reloop is 241237",
			element: React.createElement(OTPTokenEmail, {
				otp: "241237",
				email: recipient,
				baseUrl,
			}),
		},
		{
			name: "Welcome Email",
			from: `"Reloop Team" <team@local.reloop.sh>`,
			subject: "Welcome to Reloop! Open-source email infrastructure",
			text: "Welcome to Reloop! Open-source email infrastructure built for scale.",
			element: React.createElement(WelcomeEmail, {
				fullName: "John Doe",
				baseUrl,
				theme: "light",
			}),
		},
		{
			name: "Team Invite Email",
			from: `"Reloop Invites" <invite@local.reloop.sh>`,
			subject: "Join Reloop Alpha team on Reloop",
			text: "Alice Smith has invited you to the Reloop Alpha team.",
			element: React.createElement(InviteEmail, {
				inviteeName: "John Doe",
				inviterName: "Alice Smith",
				inviterEmail: "alice@local.reloop.sh",
				teamName: "Reloop Alpha",
				inviteUrl: `${baseUrl}/invite/reloop-alpha-123`,
				baseUrl,
				theme: "dark",
			}),
		},
	];

	console.log(`🚀 Starting test email batch send to: ${recipient}`);

	for (const email of emails) {
		console.log(`\n⏳ Rendering ${email.name}...`);
		const html = await render(email.element);

		console.log(`⏳ Sending ${email.name} from: ${email.from}...`);
		const info = await transporter.sendMail({
			from: email.from,
			to: recipient,
			subject: email.subject,
			text: email.text,
			html,
		});

		console.log(`✅ ${email.name} sent successfully! ID: ${info.messageId}`);
	}

	console.log("\n🎉 All test emails have been sent successfully!");
}

run().catch(console.error);
