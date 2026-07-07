import { FaqSection } from "@reloop/web/components/faq-section";

const smtpFaqItems = [
	{
		question: "What credentials do I use for SMTP?",
		answer:
			"Host smtp.reloop.sh, username reloop, and your Reloop API key as the password. Port 587 with STARTTLS works for most mailers; 2465 and 2587 are also available for direct TLS.",
	},
	{
		question: "Do SMTP sends count toward my email quota?",
		answer:
			"Yes. Each successfully sent email via SMTP relay counts toward your monthly quota—the same as transactional API sends and campaign deliveries.",
	},
	{
		question: "Can I use SMTP without changing my app code?",
		answer:
			"If your app already sends email over SMTP, you only need to update the host, port, username, and password in your existing mailer configuration. No SDK or API migration required.",
	},
	{
		question: "Which ports and encryption should I use?",
		answer:
			"Port 587 with STARTTLS is the recommended default for most frameworks and mailers. Use port 2465 or 2587 if your client requires implicit TLS from the start.",
	},
	{
		question: "Does SMTP work with WordPress, Laravel, and other platforms?",
		answer:
			"Yes. Reloop provides setup guides for WordPress, Laravel, Nodemailer, Django, Rails, Supabase, and many other platforms. Each uses the same host and credentials.",
	},
	{
		question: "Can I self-host the SMTP relay?",
		answer:
			"Yes. Reloop is open source—you can run the full stack including SMTP relay on your own infrastructure, or use the hosted relay from Reloop Labs.",
	},
];

export function SmtpFaq() {
	return <FaqSection items={smtpFaqItems} id="smtp-faq" compact />;
}
