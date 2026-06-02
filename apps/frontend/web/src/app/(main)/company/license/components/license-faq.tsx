import { FaqSection } from "@reloop/web/components/faq-section";

const licenseFaqItems = [
	{
		question: "Can I use Reloop in my company internally?",
		answer:
			"Yes. Personal use and internal company use are permitted under the license when you self-host the open-source version.",
	},
	{
		question: "Can I offer Reloop as a hosted email service?",
		answer:
			"No. You may not offer Reloop or a modified version as a hosted email service (SaaS, PaaS, or similar). There is no commercial license—self-hosting is the only permitted way to use Reloop.",
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
			"Self-host the open-source version on your own infrastructure. See our self-hosting guide for setup instructions.",
	},
];

export function LicenseFaq() {
	return <FaqSection items={licenseFaqItems} id="license-faq" plain />;
}
