// scratch/test-smtp.ts

import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import React from "react";
import { OTPTokenEmail } from "./apps/backend/email/emails/otp";

async function run() {
	const fromEmail = "sender@local.reloop.sh";
	console.log(`✅ Using verified sender: ${fromEmail}`);

	const transporter = nodemailer.createTransport({
		host: "localhost",
		port: 25,
		secure: false,
		auth: {
			user: "reloop",
			pass: "rl_prod_XRxp0NReJCCKhtIXfzl1O0QgUlk", // Replace with your generated API key
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	const otp = "241237";
	const recipient = "pranavkpatel97@gmail.com";
	const baseUrl = "https://local.reloop.sh";

	console.log("⏳ Rendering OTP email template to HTML...");
	const html = await render(
		React.createElement(OTPTokenEmail, {
			otp,
			email: recipient,
			baseUrl,
		}),
	);

	console.log("⏳ Sending email via SMTP...");
	const info = await transporter.sendMail({
		from: `"Reloop" <${fromEmail}>`,
		to: recipient,
		subject: "Your login code for Reloop",
		text: `Your login code for Reloop is ${otp}`,
		html,
	});

	console.log("✅ Message sent successfully!");
	console.log("ID:", info.messageId);
}

run().catch(console.error);
