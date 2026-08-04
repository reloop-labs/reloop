process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const API_KEY = process.env.RELOOP_API_KEY || "rl_prod_Bdaz6xFbe09ObMehYDNTYj7NXc4";
const BASE_URL = process.env.RELOOP_BASE_URL || "https://local.reloop.sh";
const RECIPIENT = process.argv[2] || "albindar@gamil.com";

async function sendTestEmail() {
	console.log(`🚀 Sending test email to ${RECIPIENT} via ${BASE_URL}...`);
	console.log(`🔑 Using API Key: ${API_KEY.slice(0, 10)}...`);

	try {
		const res = await fetch(`${BASE_URL}/api/mail/v1/send`, {
			method: "POST",
			headers: {
				"x-api-key": API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: "Reloop <hello@local.reloop.sh>",
				to: RECIPIENT,
				subject: "Test Email from Reloop API",
				text: "Hello! This is a test email sent using the Reloop API key.",
				html: "<div style='font-family: sans-serif; padding: 20px; color: #333;'><h2>Reloop Test Email</h2><p>This email was successfully sent via <strong>Reloop API</strong>.</p></div>",
			}),
		});

		const data = await res.json();
		console.log(`\nStatus Code: ${res.status}`);
		console.log("Response Payload:\n", JSON.stringify(data, null, 2));
		return data;
	} catch (error) {
		console.error("❌ Error sending email:", error);
	}
}

sendTestEmail();
