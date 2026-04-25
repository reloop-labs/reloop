/**
 * Script to send an email via the Reloop Inject API.
 *
 * Usage:
 * bun run scripts/inject-email.ts
 */

const INJECT_URL = "https://send.reloop.sh/api/inject/v1";

async function sendEmail() {
  const payload = {
    envelope_sender: "noreply@reloop.sh",
    content: "Subject: Hello from Reloop\n\nThis is a test email sent via the Reloop Inject API.",
    recipients: [
      {
        email: "recipient@example.com",
      },
    ],
  };

  console.log(`Sending email to ${payload.recipients[0].email} via ${INJECT_URL}...`);

  try {
    const response = await fetch(INJECT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
