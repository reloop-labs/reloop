import { FaqSection } from "@reloop/web/components/faq-section";

const licenseFaqItems = [
	{
		question: "Can I use Reloop without self-hosting?",
		answer:
			"Yes. Reloop Labs offers a hosted email service with the same capabilities as the self-hosted platform—transactional email, campaigns, SMTP, templates, webhooks, and more.",
	},
	{
		question: "Can I use Reloop in my company internally?",
		answer:
			"Yes. Use our hosted service or deploy Reloop on your own infrastructure for internal company email—both are permitted under the license for personal and internal use.",
	},
	{
		question: "Can I offer Reloop as a hosted email service to others?",
		answer:
			"Not as a third-party commercial SaaS. Reloop Labs operates the official hosted service. You may not sell, sublicense, or offer Reloop—or a modified version—as a competing commercial hosted email service (SaaS, PaaS, or similar).",
	},
	{
		question: "Can I sell or sublicense Reloop?",
		answer:
			"No. You may not sell, sublicense, or otherwise commercially redistribute the software.",
	},
	{
		question: "Can I modify Reloop and keep changes private?",
		answer:
			"Yes, for personal or internal company use when self-hosted. If you distribute a modified version, you must comply with Apache 2.0 and the additional use restrictions.",
	},
	{
		question: "How do I run Reloop for my business?",
		answer:
			"Sign up for our hosted service, or deploy the open-source platform on your own infrastructure—see our self-hosting guide for setup instructions.",
	},
];

export function LicenseFaq() {
	return <FaqSection items={licenseFaqItems} id="license-faq" plain />;
}
