/**
 * Script to send an email via the Reloop Inject API.
 *
 * Usage:
 * bun run scripts/inject-email.ts
 */

const INJECT_URL_LOCAL = "http://localhost:8020/api/inject/v1";
const API_KEY = process.env.X_KUMOMTA_KEY || "reloop";

async function sendEmail() {
  const payload = {
    envelope_sender: "noreply@reloop.sh",
    content: "",
    recipients: [
      {
        email: "pranavkp.me@outlook.com",
      },
    ],
  };

  payload.content = `From: Reloop <${payload.envelope_sender}>\nTo: ${payload.recipients[0].email}\nSubject: Hello from Reloop\n\nThis is a test email sent via the Reloop Inject API.`;

  console.log(`Sending email to ${payload.recipients[0].email} via ${INJECT_URL_LOCAL}...`);

  try {
    const response = await fetch(INJECT_URL_LOCAL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X_KUMOMTA_KEY": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} ${response.statusText}`);
      console.error(errorText);
      return;
    }

    const result = await response.json();
    console.log("Email injected successfully!");
    console.log("Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

sendEmail();
