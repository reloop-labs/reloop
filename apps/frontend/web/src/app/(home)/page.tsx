import { JsonLd } from "@reloop/web/components/json-ld";
import {
	defaultOgImage,
	getSiteUrl,
	siteDescription,
	siteName,
	socialProfiles,
} from "@reloop/web/lib/site";
import CTA from "./components/cta";
import Faq from "./components/faq";
import Hero from "./components/hero";
import OpenSource from "./components/open-source";
import UseCase from "./components/use-case";


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();

const homeSchema = [
	{
		"@context": "https://schema.org" as const,
		"@type": "WebSite" as const,
		name: siteName,
		url: siteUrl,
		description: siteDescription,
	},
	{
		"@context": "https://schema.org" as const,
		"@type": "Organization" as const,
		name: "Reloop Labs",
		alternateName: siteName,
		url: siteUrl,
		logo: `${siteUrl}${defaultOgImage}`,
		sameAs: [socialProfiles.github, socialProfiles.x, socialProfiles.discord],
	},
	{
		"@context": "https://schema.org" as const,
		"@type": "SoftwareApplication" as const,
		name: siteName,
		operatingSystem: "All",
		applicationCategory: "DeveloperApplication",
		description: siteDescription,
		offers: {
			"@type": "Offer" as const,
			price: "0",
			priceCurrency: "USD",
		},
	},
	{
		"@context": "https://schema.org" as const,
		"@type": "FAQPage" as const,
		mainEntity: [
			{
				"@type": "Question" as const,
				name: "What is Reloop?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Reloop is open-source email infrastructure—the same capabilities as proprietary platforms (transactional email, campaigns, SMTP, webhooks, analytics). Use it as a hosted service from Reloop Labs, or self-host the codebase on your own servers.",
				},
			},
			{
				"@type": "Question" as const,
				name: "What email providers are supported?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Reloop supports all major email providers and SMTP servers. Our platform is designed to work with any email service that uses standard SMTP protocols, ensuring maximum compatibility and flexibility.",
				},
			},
			{
				"@type": "Question" as const,
				name: "Who can benefit from using Reloop?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Reloop is ideal for developers building applications that require email functionality, marketing teams managing large-scale email campaigns, and businesses that need reliable email delivery without vendor lock-in.",
				},
			},
			{
				"@type": "Question" as const,
				name: "Is Reloop open-source?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Yes, Reloop is open-source. You can view our codebase on GitHub, audit it for security, and even contribute to the project. This ensures complete transparency and gives you full control over your email infrastructure.",
				},
			},
			{
				"@type": "Question" as const,
				name: "What is the difference between Reloop and other email services?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Reloop offers the same email infrastructure as proprietary vendors—but our codebase is open source and self-hostable. Use our hosted service or deploy on your own servers. No vendor lock-in, full transparency, and sub-900ms delivery latency.",
				},
			},
			{
				"@type": "Question" as const,
				name: "How do I use Reloop?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Two ways: sign up for Reloop as a hosted service from Reloop Labs, or self-host the open-source platform on your infrastructure (Docker, Kubernetes, bare metal). Same APIs, SMTP relay, campaigns, templates, and webhooks either way.",
				},
			},
			{
				"@type": "Question" as const,
				name: "How does Reloop handle email delivery?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Reloop uses advanced email delivery infrastructure with intelligent routing, automatic retries, and delivery optimization. Our platform monitors delivery rates in real-time and adjusts routing to ensure maximum inbox placement.",
				},
			},
			{
				"@type": "Question" as const,
				name: "Why is delivery latency so low?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Reloop achieves sub-900ms delivery latency through optimized infrastructure, direct connections to major email providers, and efficient routing algorithms. Our platform is built from the ground up for speed and reliability.",
				},
			},
		],
	},
];

export default function Home() {
	return (
		<div>
			<JsonLd data={homeSchema} />
			<Hero />
			<UseCase />
			<OpenSource />
			<CTA />
			<Faq />
		</div>
	);
}
