import { Icon } from "@reloop/ui/icon";
import { FaqSection } from "@reloop/web/components/faq-section";

export const transactionalFaq = [
	{
		question: "Will my emails land in spam?",
		answer:
			"Most spam problems come from missing or broken SPF, DKIM and DMARC records. Reloop walks you through setting them up for your DNS provider and checks them live before every send, so a broken record never silently ruins delivery. Bounced and complained addresses are suppressed automatically to protect your reputation.",
	},
	{
		question: "How do I know an email was actually delivered?",
		answer:
			"Every send gets a log showing whether it was queued, sent, delivered, bounced or failed. You can also subscribe to webhooks such as email.delivered, email.delivery_delayed, email.bounced and email.failed so your app knows in real time.",
	},
	{
		question: "Can I retry a send without emailing the user twice?",
		answer:
			"Yes. Pass an Idempotency-Key header (or idempotency_key in the body). Retrying with the same key returns the original send instead of delivering a second copy. If the first attempt failed to transmit, the retry is sent as normal.",
	},
	{
		question: "How hard is it to switch from SendGrid, Resend or SES?",
		answer:
			"If you send over SMTP, change the host to smtp.reloop.sh and use your Reloop API key as the password. If you use an API, the send call is a single POST with from, to, subject and html. Book a call and we'll help you move.",
	},
	{
		question: "What does it cost?",
		answer:
			"The free plan includes 3,000 emails a month with no credit card. Paid plans scale with volume, and because Reloop is open source you can also self-host it on your own servers.",
	},
	{
		question: "Do I need a developer to edit email content?",
		answer:
			"No. Store templates in Reloop and send them by id with variables like name or code. Copy changes happen in Reloop, not in a code deploy.",
	},
];

export function TransactionalFaq() {
	return (
		<FaqSection
			items={transactionalFaq}
			id="transactional-faq"
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
