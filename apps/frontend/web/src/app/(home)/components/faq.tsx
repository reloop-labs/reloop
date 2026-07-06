import { FaqSection } from "@reloop/web/components/faq-section";

const faqItems = [
	{
		question: "What is Reloop?",
		answer:
			"Reloop is open-source email infrastructure—the same capabilities as proprietary platforms (transactional email, campaigns, SMTP, webhooks, analytics). Use it as a hosted service from Reloop Labs, or self-host the codebase on your own servers.",
	},
	{
		question: "What email providers are supported?",
		answer:
			"Reloop supports all major email providers and SMTP servers. Our platform is designed to work with any email service that uses standard SMTP protocols, ensuring maximum compatibility and flexibility.",
	},
	{
		question: "Who can benefit from using Reloop?",
		answer:
			"Reloop is ideal for developers building applications that require email functionality, marketing teams managing large-scale email campaigns, and businesses that need reliable email delivery without vendor lock-in.",
	},
	{
		question: "Is Reloop open-source?",
		answer:
			"Yes, Reloop is open-source. You can view our codebase on GitHub, audit it for security, and even contribute to the project. This ensures complete transparency and gives you full control over your email infrastructure.",
	},
	{
		question: "What is the difference between Reloop and other email services?",
		answer:
			"Reloop offers the same email infrastructure as proprietary vendors—but our codebase is open source and self-hostable. Use our hosted service or deploy on your own servers. No vendor lock-in, full transparency, and sub-900ms delivery latency.",
	},
	{
		question: "How do I use Reloop?",
		answer:
			"Two ways: sign up for Reloop as a hosted service from Reloop Labs, or self-host the open-source platform on your infrastructure (Docker, Kubernetes, bare metal). Same APIs, SMTP relay, campaigns, templates, and webhooks either way.",
	},
	{
		question: "How does Reloop handle email delivery?",
		answer:
			"Reloop uses advanced email delivery infrastructure with intelligent routing, automatic retries, and delivery optimization. Our platform monitors delivery rates in real-time and adjusts routing to ensure maximum inbox placement.",
	},
	{
		question: "Why is delivery latency so low?",
		answer:
			"Reloop achieves sub-900ms delivery latency through optimized infrastructure, direct connections to major email providers, and efficient routing algorithms. Our platform is built from the ground up for speed and reliability.",
	},
];

const Faq = () => {
	return <FaqSection items={faqItems} plain />;
};

export default Faq;
