import { FaqSection } from "@reloop/web/components/faq-section";

const licenseFaqItems = [
	{
		question: "Can I use Reloop in my company internally?",
		answer:
			"Yes. Personal use and internal company use are permitted under the license.",
	},
	{
		question: "Can I offer Reloop as a hosted email service?",
		answer:
			"No. Offering Reloop or a modified version as a commercial hosted service (SaaS, PaaS, or similar) is not permitted without a separate commercial license.",
	},
	{
		question: "Can I sell or sublicense Reloop?",
		answer:
			"No. You may not sell, sublicense, or otherwise commercially redistribute the software under the standard license.",
	},
	{
		question: "Can I modify Reloop and keep changes private?",
		answer:
			"Yes, for personal or internal company use. If you distribute a modified version, you must comply with Apache 2.0 and the additional use restrictions.",
	},
	{
		question: "How do I get a commercial license?",
		answer:
			"Contact reloop.sh@gmail.com for commercial licensing or partnership inquiries.",
	},
];

export function LicenseFaq() {
	return <FaqSection items={licenseFaqItems} id="license-faq" compact />;
}
