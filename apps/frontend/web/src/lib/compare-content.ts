import { resendComparisonCategories } from "@reloop/web/app/compare/resend/comparison-data";
import { loopsComparisonCategories } from "@reloop/web/app/compare/loops/comparison-data";
import {
	comparisonCellText,
	type ComparisonCategory,
	type ComparisonFeatureRow,
} from "@reloop/web/app/compare/compare-types";
import { pricingFaqItems } from "@reloop/web/lib/pricing-faq";
import {
	faqPageJsonLd,
	pricingProductJsonLd,
	type FaqEntry,
} from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";

export type ComparePageContent = {
	slug: string;
	competitor: string;
	title: string;
	description: string;
	summary: string;
	categories?: ComparisonCategory[];
	features?: ComparisonFeatureRow[];
	faqs: FaqEntry[];
};

const sendgridFeatures: ComparisonFeatureRow[] = [
	{
		label: "Open-source codebase",
		reloop: "Yes (Apache 2.0)",
		competitor: "No",
	},
	{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
	{ label: "Transactional API", reloop: "Yes", competitor: "Yes" },
	{ label: "Marketing campaigns", reloop: "Yes", competitor: "Yes" },
	{ label: "Template editor", reloop: "Yes", competitor: "Yes" },
	{ label: "SMTP relay", reloop: "Yes", competitor: "Yes" },
	{ label: "Webhooks", reloop: "Yes", competitor: "Yes" },
	{
		label: "Agent inbox",
		reloop: "Built-in",
		competitor: "Not included",
	},
	{
		label: "Contract flexibility",
		reloop: "Monthly tiers + self-host",
		competitor: "Often annual enterprise",
	},
];

const mailgunFeatures: ComparisonFeatureRow[] = [
	{
		label: "Open-source codebase",
		reloop: "Yes (Apache 2.0)",
		competitor: "No",
	},
	{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
	{ label: "REST API", reloop: "Yes", competitor: "Yes" },
	{ label: "SMTP relay", reloop: "Yes", competitor: "Yes" },
	{
		label: "Inbound / reply handling",
		reloop: "Agent inbox",
		competitor: "Inbound routes",
	},
	{ label: "Email validation API", reloop: "Yes", competitor: "Yes" },
	{
		label: "Marketing campaigns",
		reloop: "Yes",
		competitor: "Limited",
	},
	{ label: "Agent / AI workflows", reloop: "Yes", competitor: "No" },
	{
		label: "Free tier",
		reloop: "3,000 emails / month · 200 / day",
		competitor: "Trial-based",
	},
];

const awsSesFeatures: ComparisonFeatureRow[] = [
	{
		label: "Open-source platform",
		reloop: "Yes (Apache 2.0)",
		competitor: "No",
	},
	{
		label: "Self-host on your AWS account",
		reloop: "Yes",
		competitor: "SES only",
	},
	{
		label: "Marketing campaigns UI",
		reloop: "Yes",
		competitor: "No (DIY)",
	},
	{ label: "Transactional API", reloop: "Yes", competitor: "Yes" },
	{
		label: "Built-in delivery dashboard",
		reloop: "Yes",
		competitor: "CloudWatch / DIY",
	},
	{
		label: "Webhooks",
		reloop: "Native",
		competitor: "SNS configuration",
	},
	{
		label: "Template management",
		reloop: "Yes",
		competitor: "Limited",
	},
	{ label: "Agent inbox", reloop: "Yes", competitor: "No" },
	{
		label: "Per-email list price",
		reloop: "Tier bundles",
		competitor: "Very low at scale",
	},
];

const postmarkFeatures: ComparisonFeatureRow[] = [
	{
		label: "Open-source codebase",
		reloop: "Yes (Apache 2.0)",
		competitor: "No",
	},
	{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
	{ label: "Transactional API", reloop: "Yes", competitor: "Yes" },
	{
		label: "Delivery analytics",
		reloop: "Yes",
		competitor: "Yes (detailed)",
	},
	{
		label: "Marketing campaigns",
		reloop: "Yes",
		competitor: "Limited",
	},
	{ label: "SMTP relay", reloop: "Yes", competitor: "Yes" },
	{
		label: "Message streams / separation",
		reloop: "Domain + campaign types",
		competitor: "Streams",
	},
	{ label: "Agent inbox", reloop: "Yes", competitor: "No" },
	{
		label: "Free tier",
		reloop: "3,000 emails / month · 200 / day",
		competitor: "Trial credits",
	},
];

const mailchimpFeatures: ComparisonFeatureRow[] = [
	{
		label: "Open-source codebase",
		reloop: "Yes (Apache 2.0)",
		competitor: "No",
	},
	{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
	{
		label: "Newsletter / campaigns",
		reloop: "Yes",
		competitor: "Yes (primary)",
	},
	{
		label: "Transactional API",
		reloop: "Yes",
		competitor: "Separate product path",
	},
	{ label: "SMTP relay", reloop: "Yes", competitor: "Limited" },
	{
		label: "Developer API focus",
		reloop: "Primary",
		competitor: "Secondary",
	},
	{
		label: "Visual drag-and-drop editor",
		reloop: "Yes",
		competitor: "Yes (advanced)",
	},
	{ label: "Agent inbox", reloop: "Yes", competitor: "No" },
	{
		label: "Pricing basis",
		reloop: "Emails sent",
		competitor: "Contacts stored",
	},
];

export const comparePages: ComparePageContent[] = [
	{
		slug: "resend",
		competitor: "Resend",
		title: "Reloop vs Resend",
		description:
			"Learn how Reloop compares to Resend and why Reloop is an open-source alternative for developer email.",
		summary:
			"Reloop is email infrastructure you can host or self-host (Apache 2.0, KumoMTA). Resend is a hosted DX layer over Amazon SES. Reloop Free is 3,000 emails/month with a 200/day cap; Individual is $10/month for 25,000 emails with no daily cap. Reloop is not a drop-in Resend proxy.",
		categories: resendComparisonCategories,
		faqs: [
			{
				question: "Does Reloop Free have a daily send limit?",
				answer:
					"Yes. Reloop Free includes 3,000 emails per month and 200 emails per day. Individual ($10/mo), Startup ($20/mo), and Enterprise have no daily cap. Self-hosted Reloop is limited by your own infrastructure, not Reloop Cloud quotas.",
			},
			{
				question: "Is Reloop a drop-in Resend API?",
				answer:
					"No. Reloop is not a Resend proxy. Plan a small client adapter when migrating. Auth uses the x-api-key header with rl_ keys.",
			},
			{
				question: "Is Reloop open source?",
				answer:
					"Yes. Reloop is licensed under Apache License 2.0 plus additional Reloop Labs terms: personal and internal self-host is allowed; commercial redistribution, third-party hosted services, and competing products are not. See https://reloop.sh/license. Reloop Cloud is the official hosted service.",
			},
		],
	},
	{
		slug: "sendgrid",
		competitor: "SendGrid",
		title: "Reloop vs SendGrid",
		description:
			"Learn how Reloop compares to SendGrid for transactional and marketing email.",
		summary:
			"SendGrid bundles transactional APIs, marketing campaigns, and deliverability tooling—often with annual commits. Reloop is API-first, Apache 2.0, and self-hostable, with campaigns and transactional sends in one codebase. Reloop Cloud Free is 3,000 emails/month (200/day).",
		features: sendgridFeatures,
		faqs: [
			{
				question: "Can Reloop handle SendGrid-scale volume?",
				answer:
					"Hosted Individual ($10/mo, 25,000 emails), Startup ($20/mo, 50,000 emails), and Enterprise target growing throughput; overage is $0.80 per 1,000. Self-hosted Reloop scales with your Kubernetes or bare-metal footprint.",
			},
			{
				question: "What about dedicated IPs?",
				answer:
					"Dedicated IPs are optional/custom on Reloop Enterprise. Self-hosted deployments can attach your own IPs directly to your MTA layer.",
			},
		],
	},
	{
		slug: "mailgun",
		competitor: "Mailgun",
		title: "Reloop vs Mailgun",
		description:
			"Learn how Reloop compares to Mailgun for developer email APIs and SMTP.",
		summary:
			"Reloop offers REST + SMTP, inbound agent inbox, and Apache 2.0 self-host. Mailgun is hosted SaaS with inbound routes. Reloop Free is 3,000 emails/month (200/day).",
		features: mailgunFeatures,
		faqs: [
			{
				question: "Can Reloop replace Mailgun inbound routes?",
				answer:
					"Reloop's agent inbox and webhook model cover reply handling and automated triage. Map your existing inbound URLs to Reloop handlers during migration.",
			},
			{
				question: "Do we lose deliverability moving off Mailgun?",
				answer:
					"Deliverability depends on domain reputation, content, and IPs—not the dashboard brand. Self-hosted Reloop lets you own IPs directly; hosted Reloop manages shared pools like other providers.",
			},
		],
	},
	{
		slug: "aws-ses",
		competitor: "AWS SES",
		title: "Reloop vs AWS SES",
		description:
			"Learn how Reloop compares to Amazon SES as an email platform, not just an SMTP pipe.",
		summary:
			"SES is raw sending infrastructure. Reloop is a full email platform (API, campaigns, dashboard, agent inbox) that you can host or self-host. SES is often cheaper at extreme volume; Reloop competes on platform TCO, not on being the cheapest SMTP pipe.",
		features: awsSesFeatures,
		faqs: [
			{
				question: "Is Reloop cheaper than SES at 10M emails/month?",
				answer:
					"SES raw sending is often cheaper at extreme volume. Reloop competes on platform TCO—engineering time, campaign tooling, support, and unified ops—not on being the cheapest SMTP pipe.",
			},
			{
				question: "Can we migrate boto3 sends to Reloop?",
				answer:
					"Yes. Replace AWS SDK send calls with Reloop REST or SMTP. Map SNS bounce notifications to Reloop webhook endpoints.",
			},
			{
				question: "Do we need both SES and Reloop?",
				answer:
					"Not usually. Self-hosted Reloop includes outbound delivery. Some teams keep SES as an MTA backend during transition—that is an advanced integration, not the default path.",
			},
		],
	},
	{
		slug: "postmark",
		competitor: "Postmark",
		title: "Reloop vs Postmark",
		description:
			"Learn how Reloop compares to Postmark for transactional email.",
		summary:
			"Postmark focuses on transactional delivery with streams. Reloop unifies transactional API sends and campaigns, is Apache 2.0 / self-hostable, and offers an agent inbox. Reloop Free is 3,000 emails/month (200/day).",
		features: postmarkFeatures,
		faqs: [
			{
				question: "Does Reloop match Postmark latency?",
				answer:
					"Hosted Reloop targets production-grade transactional latency. Self-hosted performance depends on your network and MTA setup—same as any self-managed stack.",
			},
			{
				question: "Should we use both for streams?",
				answer:
					"Reloop can separate transactional API sends from campaign traffic without two vendors. Most Postmark stream use cases map to Reloop domains plus campaign modules.",
			},
		],
	},
	{
		slug: "loops",
		competitor: "Loops",
		title: "Reloop vs Loops",
		description:
			"Compare Reloop to Loops: send-based pricing vs contact-list pricing, plus transactional API and self-host.",
		summary:
			"Loops prices by contact list size. Reloop prices by emails sent. Reloop Free is 3,000 emails/month (200/day); Individual is $10/month for 25,000 emails; Startup is $20/month for 50,000 emails. Reloop is the ESP/MTA, not a lifecycle UI on top of another sender.",
		categories: loopsComparisonCategories,
		faqs: [
			{
				question:
					"Why should we choose send-based pricing over contact-based pricing?",
				answer:
					"Contact-based pricing charges you for inactive leads and users who never open your emails. Reloop's send-based pricing charges for emails sent. Free is 3,000 emails/month (200/day); paid overage is $0.80 per 1,000.",
			},
			{
				question:
					"Can Reloop handle both marketing campaigns and transactional APIs?",
				answer:
					"Yes. Reloop includes transactional API endpoints, SMTP relay, templates, broadcast campaigns, and an agent inbox. Reloop is the email infrastructure, not a connector to another ESP.",
			},
			{
				question: "Can we self-host Reloop while migrating from Loops?",
				answer:
					"Yes. Reloop is Apache 2.0. You can deploy on your own Kubernetes or Docker infrastructure with no Reloop license fee. You still pay for your own servers and IPs.",
			},
		],
	},
	{
		slug: "mailchimp",
		competitor: "Mailchimp",
		title: "Reloop vs Mailchimp",
		description:
			"Compare Reloop to Mailchimp: send-based developer email vs contact-list marketing SaaS.",
		summary:
			"Mailchimp is a marketer-first, contact-priced platform. Reloop is developer-first email infrastructure with send-based Reloop Cloud pricing and an Apache 2.0 self-host path. Reloop Free is 3,000 emails/month (200/day).",
		features: mailchimpFeatures,
		faqs: [
			{
				question: "Can non-technical teammates still send campaigns?",
				answer:
					"Yes. Reloop includes a campaign builder and template editor. Mailchimp's visual editor is more mature for pure marketer workflows—evaluate with your marketing lead.",
			},
			{
				question: "Is Reloop only for developers?",
				answer:
					"Reloop is developer-first but not developer-only. Teams that want API control and marketer-friendly campaigns fit best. Reloop is an ESP/email infrastructure product, not a multi-provider email router.",
			},
		],
	},
];

export function getComparePage(slug: string): ComparePageContent | undefined {
	return comparePages.find((page) => page.slug === slug);
}

export function listComparePages(): ComparePageContent[] {
	return comparePages;
}

function featuresTableMarkdown(
	competitor: string,
	features: ComparisonFeatureRow[],
): string[] {
	const lines = [
		"| Feature | Reloop | " + competitor + " |",
		"| --- | --- | --- |",
	];
	for (const row of features) {
		lines.push(
			`| ${row.label} | ${comparisonCellText(row.reloop)} | ${comparisonCellText(row.competitor)} |`,
		);
	}
	return lines;
}

function categoriesMarkdown(
	competitor: string,
	categories: ComparisonCategory[],
): string[] {
	const lines: string[] = [];
	for (const category of categories) {
		lines.push(`## ${category.label}`, "");
		if (category.intro) {
			lines.push(category.intro, "");
		}
		lines.push(...featuresTableMarkdown(competitor, category.features), "");
	}
	return lines;
}

export function buildCompareMarkdown(slug: string): string | null {
	const page = getComparePage(slug);
	if (!page) return null;
	const origin = getSiteUrl();
	const path = `/compare/${page.slug}`;
	const lines: string[] = [
		`# ${page.title}`,
		"",
		`> ${page.description}`,
		"",
		`HTML: ${origin}${path}`,
		`Markdown: ${origin}${path}.md`,
		`Canonical pricing: ${origin}/pricing.md`,
		"",
		page.summary,
		"",
		"Reloop is the email service / infrastructure (ESP + MTA). It is not a multi-ESP connector that sits on SendGrid, Mailgun, Resend, or SES.",
		"",
	];

	if (page.categories) {
		lines.push(...categoriesMarkdown(page.competitor, page.categories));
	} else if (page.features) {
		lines.push(`## ${page.title}`, "");
		lines.push(...featuresTableMarkdown(page.competitor, page.features), "");
	}

	if (page.faqs.length > 0) {
		lines.push("## FAQ", "");
		for (const faq of page.faqs) {
			lines.push(`### ${faq.question}`, "", faq.answer, "");
		}
	}

	lines.push(
		"## Related",
		"",
		`- Pricing: ${origin}/pricing.md`,
		`- Compare index: ${origin}/compare.md`,
		`- License (Apache 2.0): ${origin}/license`,
		"",
	);

	return lines.join("\n");
}

export function buildCompareIndexMarkdown(): string {
	const origin = getSiteUrl();
	const lines: string[] = [
		"# Reloop vs the competition",
		"",
		"> Compare Reloop with Resend, SendGrid, Mailgun, AWS SES, Postmark, Loops, and Mailchimp.",
		"",
		`HTML: ${origin}/compare`,
		`Canonical pricing: ${origin}/pricing.md`,
		"",
		"Reloop is open-source email infrastructure (Apache 2.0): transactional API, SMTP, campaigns, webhooks, and an agent inbox. Hosted Reloop Cloud plans are Free (3,000 emails/month, 200/day), Individual $10/month (25,000), Startup $20/month (50,000), Enterprise custom. Self-host has no Reloop license fee.",
		"",
		"## Comparisons",
		"",
	];
	for (const page of comparePages) {
		lines.push(
			`- [${page.title}](${origin}/compare/${page.slug}) — [markdown](${origin}/compare/${page.slug}.md)`,
		);
	}
	lines.push("", "## Hosted pricing (source of truth)", "");
	for (const faq of pricingFaqItems.slice(0, 2)) {
		lines.push(`### ${faq.question}`, "", faq.answer, "");
	}
	return lines.join("\n");
}

export function buildCompareJsonLd(page: ComparePageContent) {
	const siteUrl = getSiteUrl();
	const url = `${siteUrl}/compare/${page.slug}`;
	const graph: Record<string, unknown>[] = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: page.title,
			description: page.description,
			url,
			about: {
				"@type": "SoftwareApplication",
				name: "Reloop",
				applicationCategory: "DeveloperApplication",
				url: siteUrl,
			},
		},
		pricingProductJsonLd(siteUrl),
	];
	if (page.faqs.length > 0) {
		graph.push(faqPageJsonLd(page.faqs));
	}
	return graph;
}

export { sendgridFeatures, mailgunFeatures, awsSesFeatures, postmarkFeatures, mailchimpFeatures };
