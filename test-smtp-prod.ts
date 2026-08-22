import nodemailer from "nodemailer";

async function run() {
	const recipient = process.argv[2] || "test@example.com";
	const host = process.env.SMTP_HOST || "smtp.reloop.sh";
	const port = Number(process.env.SMTP_PORT) || 587;
	const apiKey = process.env.RELOOP_API_KEY || "YOUR_RELOOP_API_KEY";
	const senderEmail = process.env.SENDER_EMAIL || "hello@reloop.sh";

	console.log("🚀 Sending Hello World email...");
	console.log(`   Host: ${host}:${port}`);
	console.log(`   From: ${senderEmail}`);
	console.log(`   To:   ${recipient}`);

	const transporter = nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: {
			user: "reloop",
			pass: apiKey,
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	try {
		console.log("\n⏳ Verifying SMTP connection & auth...");
		await transporter.verify();
		console.log("✅ Authenticated successfully!\n");

		console.log("⏳ Sending message...");
		const info = await transporter.sendMail({
			from: `"Reloop Test" <${senderEmail}>`,
			to: recipient,
			subject: "Hello World from Reloop SMTP",
			text: "Hello World! This is a test email sent via Reloop SMTP relay.",
			html: "<h1>Hello World!</h1><p>This is a test email sent via <b>Reloop SMTP relay</b>.</p>",
		});

		console.log("🎉 Email sent successfully!");
		console.log("   Message ID:", info.messageId);
		console.log("   Response:", info.response);
	} catch (error) {
		console.error("\n❌ Error sending email:", error);
		process.exit(1);
	}
}

run();
