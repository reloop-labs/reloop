import nodemailer from "nodemailer";

const recipients = [
	"play@local.reloop.sh",
	"asdf@local.reloop.sh",
	"code@local.reloop.sh",
	"maro@local.reloop.sh",
];

async function main() {
	const transporter = nodemailer.createTransport({
		host: "localhost",
		port: 25,
		secure: false,
		tls: {
			rejectUnauthorized: false,
		},
	});

	for (const recipient of recipients) {
		console.log(`Sending test email to ${recipient}...`);
		try {
			const info = await transporter.sendMail({
				from: '"Tester" <tester@example.com>',
				to: recipient,
				subject: "Test Email from Antigravity",
				text: `Hello, this is a test email sent from Antigravity to verify if your agent inbox (${recipient}) works!`,
				html: `<p>Hello,</p><p>This is a test email sent from <strong>Antigravity</strong> to verify if your agent inbox (<strong>${recipient}</strong>) works!</p>`,
			});
			console.log(`✅ Email sent successfully to ${recipient}! Message ID: ${info.messageId}`);
		} catch (err) {
			console.error(`❌ Failed to send email to ${recipient}:`, err);
		}
	}
}

main().catch(console.error);
