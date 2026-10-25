import { Icon } from "@reloop/ui/icon";
import { FaqSection } from "@reloop/web/components/faq-section";

export const smtpFaq = [
	{
		question: "What credentials do I use?",
		answer:
			"Host smtp.reloop.sh, port 587 with STARTTLS, and your Reloop API key as the password. The relay authenticates on the key alone, so any username works; we use reloop in our examples.",
	},
	{
		question: "Which port should I pick?",
		answer:
			"Use 587 with STARTTLS unless your client needs something else. 465 is available for implicit TLS, and 2587 and 2465 are alternatives for hosts that block the standard ports.",
	},
	{
		question: "Do I need to change my code?",
		answer:
			"No. If your app already sends over SMTP, update the host, port, username, and password in its mail config. Queues, templates, and retries in your framework keep working.",
	},
	{
		question: "What's the difference between SMTP and the API?",
		answer:
			"Both use the same delivery pipeline, logs, webhooks, and suppression list. SMTP is the fastest way to move an existing app or tool. The API adds things SMTP can't express, like idempotency keys and sending stored templates by id.",
	},
	{
		question: "Can I keep using SES, Postmark, or my own server?",
		answer:
			"Yes. Add your SMTP provider in the dashboard, test the connection, and assign it to a domain. Mail from that domain goes out through your provider while templates, automations, and analytics stay in Reloop.",
	},
	{
		question: "Do SMTP sends count toward my quota?",
		answer:
			"Yes, each recipient counts once, the same as API sends. The free plan includes 6,000 emails a month with no credit card. Because Reloop is open source, you can also self-host the entire relay.",
	},
];

export function SmtpFaq() {
	return (
		<FaqSection
			items={smtpFaq}
			id="smtp-faq"
			eyebrow={
				<>
					<Icon name="question" className="size-3.5" aria-hidden />
					FAQ
				</>
			}
			eyebrowClassName="inline-flex items-center gap-1.5 text-[13px] text-text-sub-600 normal-case dark:text-white/60"
			title="Questions before you switch."
			compact
			plain
		/>
	);
}
