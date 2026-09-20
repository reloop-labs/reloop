import { pricingFaqItems } from "@reloop/web/lib/pricing-faq";

export type HomeFaqItem = {
	question: string;
	answer: string;
};

export type HomeFaqGroup = {
	id: string;
	label: string;
	items: HomeFaqItem[];
};

/** Grouped landing-page FAQ - UI groups by section, JSON-LD stays flat. */
export const homeFaqGroups: HomeFaqGroup[] = [
	{
		id: "general",
		label: "General",
		items: [
			{
				question: "What is Reloop?",
				answer:
					"Reloop is an open-source email API and infrastructure platform built for developers. It offers transactional and marketing email delivery, SMTP relay, incoming email webhooks, AI agent inboxes, and deliverability tooling, available as both a hosted cloud service and fully self-hosted software.",
			},
			{
				question: "How is Reloop different from Resend, SendGrid, or Postmark?",
				answer:
					"Unlike traditional closed email services, Reloop is open-source under Apache 2.0. You get full transparency into queues, delivery pipelines, and DNS checks with zero vendor lock-in. You can self-host for free on your own servers or use Reloop Cloud with 3,000 free emails every month.",
			},
			{
				question: "Which programming languages and frameworks are supported?",
				answer:
					"Reloop provides first-party SDKs for Node.js, TypeScript, Python, Go, Rust, PHP, and Ruby, along with standard SMTP and REST APIs compatible with Next.js, Django, Ruby on Rails, Laravel, and any modern backend.",
			},
			{
				question: "Can I send both transactional and marketing emails?",
				answer:
					"Yes. Reloop supports critical transactional emails (magic links, receipts, notifications) as well as broadcast marketing campaigns, contact audiences, and deliverability analytics from a unified interface and API.",
			},
			{
				question: "Does Reloop support incoming email and AI agent workflows?",
				answer:
					"Yes. Reloop includes webhook-based inbound email routing and dedicated agent inboxes so AI models, automated workflows, and backend services can receive, parse, and respond to incoming emails programmatically.",
			},
		],
	},
	{
		id: "pricing",
		label: "Pricing & billing",
		/* Mirrors the pricing page FAQ so both stay in lockstep. */
		items: [...pricingFaqItems],
	},
	{
		id: "compare",
		label: "Compare: cost, developer experience & UX",
		items: [
			{
				question: "How does Reloop pricing compare to Mailgun or SendGrid?",
				answer:
					"Reloop Pro is $10 per month for 50,000 emails and Growth is $20 per month for 100,000, with overage at $0.50 per 1,000. Mailgun Basic is $15 per month for 10,000 emails and Foundation is $35 per month for 50,000, with overage from $1.30 per 1,000. SendGrid commonly pushes annual enterprise commits, while Reloop stays on monthly tiers. Full comparisons live on our compare pages.",
			},
			{
				question: "How is Reloop different from Resend for developers?",
				answer:
					"Resend is a hosted developer layer over Amazon SES focused on transactional sending. Reloop is a full email platform in one codebase: transactional API, SMTP relay, marketing campaigns, contact audiences, inbound webhooks, and agent inboxes. Reloop is not a drop-in Resend proxy, so plan a small client adapter using the x-api-key header when migrating.",
			},
			{
				question: "When should I pick Reloop over AWS SES?",
				answer:
					"Pick SES if you only need raw sending pipes at extreme volume and are happy wiring everything yourself. Pick Reloop when you want the platform around the pipe: REST and SMTP APIs, a delivery dashboard, campaign builder, templates, native webhooks instead of SNS configuration, and support. SES is often cheaper per email at huge scale, while Reloop competes on total platform cost including engineering time.",
			},
			{
				question: "How does send-based pricing compare to Mailchimp or Loops?",
				answer:
					"Mailchimp and Loops charge by contacts stored, so inactive leads cost you money every month. Reloop charges by emails sent, so a quiet list costs nothing extra. Reloop also unifies transactional and marketing sending in one product, while Mailchimp routes transactional through a separate product path.",
			},
			{
				question: "How hard is it to migrate developer code to Reloop?",
				answer:
					"SMTP senders only change host, port, and credentials. REST senders add a small client adapter, since Reloop is not a drop-in proxy for Mailgun, Resend, or SES SDK calls. First-party SDKs cover Node.js, TypeScript, Python, Go, Rust, PHP, and Ruby, and inbound routes map to Reloop webhook handlers.",
			},
			{
				question: "How does the Reloop dashboard compare on UX?",
				answer:
					"Transactional sends, broadcast campaigns, templates, delivery analytics, and agent inboxes live in one interface instead of spread across separate products or CloudWatch and SNS consoles. For pure marketer drag-and-drop workflows, Mailchimp's visual editor is still more mature, so evaluate that with your marketing lead.",
			},
		],
	},
	{
		id: "trust",
		label: "Trust & privacy: your email content",
		items: [
			{
				question: "Do you use, read, or sell the emails my app sends through Reloop?",
				answer:
					"No. We do not sell your emails, contact lists, or personal information. On Reloop Cloud, email content is processed only to deliver your mail, operate the service, and keep infrastructure safe, never for advertising or resale.",
			},
			{
				question: "Do you train AI models on my email content?",
				answer:
					"No. We do not use your hosted email content, recipients, or contact lists to train AI models. Automated checks run only for delivery, security, and abuse prevention.",
			},
			{
				question: "Who can access my email content?",
				answer:
					"Only the systems needed to deliver and secure your mail, plus trusted infrastructure providers bound by confidentiality. Human review happens only when necessary, for example a support request you open or an abuse and fraud investigation.",
			},
			{
				question: "Why do you scan outbound mail at all?",
				answer:
					"To deliver your mail and protect shared infrastructure. We monitor for abuse, fraud, and security incidents, such as phishing lures, malware, or gateway abuse, so one bad actor cannot destroy IP and domain reputation for every other customer.",
			},
			{
				question: "If I self-host Reloop, can you see my emails?",
				answer:
					"No. A self-hosted instance runs entirely on infrastructure you control. Reloop Labs does not receive your email content, contact lists, or delivery logs from your deployment unless you choose to share them, for example in a support request.",
			},
			{
				question: "How long do you keep email data?",
				answer:
					"We retain data only as long as needed to operate the service: delivery, logs, debugging, and legal obligations. Details are in our Privacy Policy, and you can exercise access, correction, or deletion rights by contacting reloop.sh@gmail.com.",
			},
		],
	},
	{
		id: "abuse",
		label: "Phishing, scams & abuse",
		items: [
			{
				question: "Can I use Reloop to send phishing emails, fake invoices, or payment scams?",
				answer:
					"No. Phishing, spoofing, fake payment or invoice lures, crypto and wallet scams, malware, and fraud are strictly prohibited on Reloop Cloud and against our Terms, even if you send from your own domain.",
			},
			{
				question: "What counts as phishing or scam abuse?",
				answer:
					"Fake security alerts, invoice or payment lures, brand impersonation, credential and seed-phrase harvesting, crypto and wallet theft narratives, malware distribution, and unsolicited SMS-gateway blasts all count as abuse under our Terms.",
			},
			{
				question: "How does Reloop prevent phishing and scams sent through the platform?",
				answer:
					"Reloop Cloud automatically classifies outbound traffic on shared infrastructure. High-severity sends such as stacked phishing or scam lures can be blocked immediately, while suspicious sends are queued for operator review to protect shared IP and domain reputation.",
			},
			{
				question: "Can I send cold outreach or bulk marketing with Reloop?",
				answer:
					"Only with proper consent and list hygiene. You are responsible for consent, authentication on your domains, bounces, and spam complaints. High complaint rates, blocklist listings, or purchased lists that harm shared deliverability may be throttled or suspended.",
			},
			{
				question: "What happens to accounts caught sending scams or phishing?",
				answer:
					"Accounts that violate acceptable use may have messages blocked, sending throttled, or API keys, domains, and accounts suspended or terminated without prior notice when delay would increase harm. Abuse-related terminations are not eligible for refunds, and serious cases may be reported to mailbox providers, registrars, or law enforcement.",
			},
			{
				question: "What if my legitimate mail is flagged by mistake?",
				answer:
					"Medium-severity sends may still be delivered while we investigate. If your sending is throttled or blocked in error, contact support with your account, domain, and a sample message ID so we can review and reclassify it.",
			},
			{
				question: "I received a suspicious email sent via Reloop. How do I report abuse?",
				answer:
					"Forward the full email with headers to reloop.sh@gmail.com and include the subject, sender, and why it looks abusive. Our team investigates reports of phishing, scams, and spam, and takes enforcement action under our Terms of Service.",
			},
		],
	},
];

/** Flat list - keeps UI and JSON-LD in lockstep. */
export const homeFaqItems: HomeFaqItem[] = homeFaqGroups.flatMap(
	(group) => group.items,
);
