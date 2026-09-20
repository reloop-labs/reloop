export type HomeFaqItem = {
	question: string;
	answer: string;
};

export const homeFaqItems: HomeFaqItem[] = [
	{
		question: "What is Reloop?",
		answer:
			"Reloop is an open-source email API and infrastructure platform built for developers. It offers transactional and marketing email delivery, SMTP relay, incoming email webhooks, AI agent inboxes, and deliverability tooling—available as both a hosted cloud service and fully self-hosted software.",
	},
	{
		question: "How is Reloop different from Resend, SendGrid, or Postmark?",
		answer:
			"Unlike traditional closed email services, Reloop is open-source under Apache 2.0. You get full transparency into queues, delivery pipelines, and DNS checks with zero vendor lock-in. You can self-host for free on your own servers or use Reloop Cloud with 3,000 free emails every month.",
	},
	{
		question: "Can I self-host Reloop for free?",
		answer:
			"Yes. The entire Reloop platform is open source on GitHub. You can deploy it using Docker or Kubernetes on your own infrastructure at no Reloop license fee for personal and internal company use—you only pay for your own hosting.",
	},
	{
		question: "Do I need a credit card to get started?",
		answer:
			"No credit card is required. The Free plan includes 3,000 emails per month and 100 emails per day on Reloop Cloud so you can build, test, and launch your product without entering billing details.",
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
		question: "What happens if I exceed my monthly free quota?",
		answer:
			"On Reloop Cloud's Free plan, sending pauses when you hit your monthly limit. You can upgrade to Pro ($10/mo) or Growth ($20/mo) at any time for higher volume and pay-as-you-go overages billed at $0.50 per 1,000 emails.",
	},
	{
		question: "Does Reloop support incoming email and AI agent workflows?",
		answer:
			"Yes. Reloop includes webhook-based inbound email routing and dedicated agent inboxes so AI models, automated workflows, and backend services can receive, parse, and respond to incoming emails programmatically.",
	},
];
