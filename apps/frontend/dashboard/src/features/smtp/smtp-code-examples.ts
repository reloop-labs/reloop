export type SmtpLanguageId =
	| "nodejs"
	| "python"
	| "go"
	| "php"
	| "ruby"
	| "rust"
	| "curl";

export type SmtpLanguageConfig = {
	id: SmtpLanguageId;
	label: string;
	shikiLang: string;
	filename: string;
};

/** Languages shown in the SMTP code panel. */
/** `shikiLang` is fed to Bright (`@code-hike/lighter`) via BrightCode. */
export const SMTP_LANGUAGES: readonly SmtpLanguageConfig[] = [
	{
		id: "nodejs",
		label: "Node.js",
		shikiLang: "js",
		filename: "send.js",
	},
	{ id: "python", label: "Python", shikiLang: "py", filename: "send.py" },
	{ id: "go", label: "Go", shikiLang: "go", filename: "send.go" },
	{ id: "php", label: "PHP", shikiLang: "php", filename: "send.php" },
	{ id: "ruby", label: "Ruby", shikiLang: "rb", filename: "send.rb" },
	{ id: "rust", label: "Rust", shikiLang: "rs", filename: "main.rs" },
	{ id: "curl", label: "cURL", shikiLang: "bash", filename: "send.sh" },
] as const;

export const SMTP_HOST = "smtp.reloop.sh";
export const SMTP_PORT = 465;
export const SMTP_USER = "reloop";

/**
 * Generate SMTP send examples. Password is the API key; username is `reloop`
 * (matches the SMTP credentials panel).
 */
export function buildSmtpCodeExamples(
	apiKeyPlaceholder = "YOUR_API_KEY",
): Record<SmtpLanguageId, string> {
	const host = SMTP_HOST;
	const port = SMTP_PORT;
	const user = SMTP_USER;
	const pass = apiKeyPlaceholder;

	return {
		nodejs: `const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "${host}",
  port: ${port},
  secure: true, // port 465
  auth: {
    user: "${user}",
    pass: process.env.RELOOP_API_KEY || "${pass}",
  },
});

async function main() {
  const info = await transporter.sendMail({
    from: '"Reloop" <onboarding@yourdomain.com>',
    to: "recipient@example.com",
    subject: "Hello from Reloop SMTP",
    text: "Congrats on sending your first email via Reloop SMTP!",
    html: "<p>Congrats on sending your first email via Reloop SMTP!</p>",
  });

  console.log("Message sent:", info.messageId);
}

main().catch(console.error);`,

		python: `import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

api_key = os.environ.get("RELOOP_API_KEY", "${pass}")

msg = MIMEMultipart()
msg["From"] = "onboarding@yourdomain.com"
msg["To"] = "recipient@example.com"
msg["Subject"] = "Hello from Reloop SMTP"

body = "<p>Congrats on sending your first email via Reloop SMTP!</p>"
msg.attach(MIMEText(body, "html"))

with smtplib.SMTP_SSL("${host}", ${port}) as server:
    server.login("${user}", api_key)
    server.sendmail(msg["From"], [msg["To"]], msg.as_string())

print("Email sent successfully!")`,

		go: `package main

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
)

func main() {
	apiKey := os.Getenv("RELOOP_API_KEY")
	if apiKey == "" {
		apiKey = "${pass}"
	}

	host := "${host}"
	port := "${port}"
	from := "onboarding@yourdomain.com"
	to := []string{"recipient@example.com"}

	msg := []byte("To: recipient@example.com\\r\\n" +
		"From: " + from + "\\r\\n" +
		"Subject: Hello from Reloop SMTP\\r\\n" +
		"Content-Type: text/html; charset=UTF-8\\r\\n" +
		"\\r\\n" +
		"<p>Congrats on sending your first email via Reloop SMTP!</p>\\r\\n")

	auth := smtp.PlainAuth("", "${user}", apiKey, host)
	tlsConfig := &tls.Config{ServerName: host}

	conn, err := tls.Dial("tcp", host+":"+port, tlsConfig)
	if err != nil {
		fmt.Println("Error connecting:", err)
		return
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		fmt.Println("Error creating client:", err)
		return
	}
	defer client.Close()

	if err = client.Auth(auth); err != nil {
		fmt.Println("Auth failed:", err)
		return
	}
	if err = client.Mail(from); err != nil {
		fmt.Println("MAIL FROM failed:", err)
		return
	}
	for _, addr := range to {
		if err = client.Rcpt(addr); err != nil {
			fmt.Println("RCPT TO failed:", err)
			return
		}
	}
	w, err := client.Data()
	if err != nil {
		fmt.Println("DATA failed:", err)
		return
	}
	if _, err = w.Write(msg); err != nil {
		fmt.Println("Write failed:", err)
		return
	}
	if err = w.Close(); err != nil {
		fmt.Println("Close failed:", err)
		return
	}
	_ = client.Quit()
	fmt.Println("Email sent successfully!")
}`,

		php: `<?php
use PHPMailer\\PHPMailer\\PHPMailer;
use PHPMailer\\PHPMailer\\Exception;

require 'vendor/autoload.php';

$mail = new PHPMailer(true);

try {
    $apiKey = getenv('RELOOP_API_KEY') ?: '${pass}';

    $mail->isSMTP();
    $mail->Host       = '${host}';
    $mail->SMTPAuth   = true;
    $mail->Username   = '${user}';
    $mail->Password   = $apiKey;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // port 465
    $mail->Port       = ${port};

    $mail->setFrom('onboarding@yourdomain.com', 'Reloop');
    $mail->addAddress('recipient@example.com');

    $mail->isHTML(true);
    $mail->Subject = 'Hello from Reloop SMTP';
    $mail->Body    = '<p>Congrats on sending your first email via Reloop SMTP!</p>';

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}`,

		ruby: `require "net/smtp"
require "openssl"

api_key = ENV.fetch("RELOOP_API_KEY", "${pass}")

message = <<~MESSAGE
  From: onboarding@yourdomain.com
  To: recipient@example.com
  MIME-Version: 1.0
  Content-type: text/html
  Subject: Hello from Reloop SMTP

  <p>Congrats on sending your first email via Reloop SMTP!</p>
MESSAGE

smtp = Net::SMTP.new("${host}", ${port})
smtp.enable_tls(OpenSSL::SSL::SSLContext.new)
smtp.start("${host}", "${user}", api_key, :plain) do |s|
  s.send_message message, "onboarding@yourdomain.com", "recipient@example.com"
end

puts "Email sent successfully!"`,

		rust: `use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use std::env;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let api_key = env::var("RELOOP_API_KEY").unwrap_or_else(|_| "${pass}".into());

    let email = Message::builder()
        .from("onboarding@yourdomain.com".parse()?)
        .to("recipient@example.com".parse()?)
        .subject("Hello from Reloop SMTP")
        .header(lettre::message::header::ContentType::TEXT_HTML)
        .body(String::from(
            "<p>Congrats on sending your first email via Reloop SMTP!</p>",
        ))?;

    let creds = Credentials::new("${user}".to_string(), api_key);

    let mailer = SmtpTransport::relay("${host}")?
        .port(${port})
        .credentials(creds)
        .build();

    match mailer.send(&email) {
        Ok(_) => println!("Email sent successfully!"),
        Err(e) => panic!("Could not send email: {e:?}"),
    }

    Ok(())
}`,

		curl: `# Send via SMTP using swaks (SMTP Swiss Army Knife)
# Install: brew install swaks  |  apt install swaks

export RELOOP_API_KEY="\${RELOOP_API_KEY:-${pass}}"

swaks \\
  --server ${host}:${port} \\
  --tls \\
  --auth LOGIN \\
  --auth-user "${user}" \\
  --auth-password "$RELOOP_API_KEY" \\
  --from "onboarding@yourdomain.com" \\
  --to "recipient@example.com" \\
  --header "Subject: Hello from Reloop SMTP" \\
  --body "<p>Congrats on sending your first email via Reloop SMTP!</p>" \\
  --add-header "Content-Type: text/html; charset=UTF-8"`,
	};
}
