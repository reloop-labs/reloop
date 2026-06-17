import axios from "axios";
import nodemailer from "nodemailer";

async function main() {
	// 1. Create nodemailer transporter pointing to the outbound SMTP server (port 587)
	const transporter = nodemailer.createTransport({
		host: "localhost",
		port: 587,
		secure: false,
		auth: {
			user: "reloop",
			pass: "rl_prod_WoG-bCrNELR71Q_-NrCGxvouruA", // User provided local API key
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	const fromEmail = "sender@local.reloop.sh";
	const toEmail = "test_outbound@example.com";
	const subject = `Test Outbound Email [${new Date().toISOString()}]`;

	console.log(`Sending outbound email from ${fromEmail} to ${toEmail}...`);

	try {
		const info = await transporter.sendMail({
			from: `"Reloop Tester" <${fromEmail}>`,
			to: toEmail,
			subject: subject,
			text: "Hello, this is a test email sent from local.reloop.sh domain using the outbound SMTP service!",
			html: "<p>Hello,</p><p>This is a test email sent from <strong>local.reloop.sh</strong> domain using the outbound SMTP service!</p>",
		});

		console.log("✅ Email submitted successfully to outbound SMTP server!");
		console.log("Message ID:", info.messageId);

		// 2. Query Mailpit to verify the email was captured
		console.log("Waiting 3 seconds for Mailpit to catch the email...");
		await new Promise((resolve) => setTimeout(resolve, 3000));

		console.log("Querying Mailpit API...");
		const mailpitResp = await axios.get(
			"http://localhost:8025/api/v1/messages",
		);
		const messages = mailpitResp.data.messages || [];

		const found = messages.find((msg: any) => msg.Subject === subject);

		if (found) {
			console.log("🎉 SUCCESS! Mailpit captured the outbound email:");
			console.log(`- From: ${found.From.Name} <${found.From.Address}>`);
			console.log(`- To: ${found.To[0].Address}`);
			console.log(`- Subject: ${found.Subject}`);
			console.log(`- Date: ${found.Created}`);
		} else {
			console.log(
				"❌ Email was not found in Mailpit. Here are the recent subjects in Mailpit:",
			);
			messages.slice(0, 5).forEach((msg: any) => {
				console.log(`  * ${msg.Subject}`);
			});
		}
	} catch (err) {
		console.error("❌ Failed to send or verify outbound email:", err);
	}
}

main().catch(console.error);
