import { KeepUpToDate } from "@reloop/web/app/careers/components/keep-up-to-date";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { WhyOpenSourceComparison } from "./components/why-open-source-comparison";
import { WhyOpenSourceDeployment } from "./components/why-open-source-deployment";
import { WhyOpenSourceLetter } from "./components/why-open-source-letter";
import { WhyOpenSourceValues } from "./components/why-open-source-values";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/why-open-source";
const pageUrl = `${getSiteUrl()}${pagePath}`;
const pageTitle = "Why Open Source | Reloop";
const pageDescription =
	"Email infrastructure you can inspect, self-host, and verify. Built under Apache 2.0 with complete parity between hosted reloop.sh and self-hosted deployments.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"open source email infrastructure",
		"Apache 2.0 email platform",
		"self-hosted email server",
		"transparent email routing",
		"open source deliverability",
		"self-hostable email",
		"open source sendgrid alternative",
		"Reloop open source",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
	},
};

const WhyOpenSourcePage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		"@id": `${pageUrl}#article`,
		url: pageUrl,
		headline: pageTitle,
		description: pageDescription,
		publisher: {
			"@type": "Organization",
			"@id": `${siteUrl}/#organization`,
			name: "Reloop Labs",
			url: siteUrl,
		},
		isPartOf: {
			"@type": "WebSite",
			"@id": `${siteUrl}/#website`,
			name: "Reloop",
			url: siteUrl,
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />

			{/* Letter from Reloop Labs at the top (License page styled layered card) */}
			<WhyOpenSourceLetter />

			{/* Commitments & 4-Column Architectural Guarantees */}
			<WhyOpenSourceValues />

			{/* Comparative Operational Decision Matrix */}
			<WhyOpenSourceComparison />

			{/* Deployment Paths (Self-Hosted vs Hosted) */}
			<WhyOpenSourceDeployment />

			{/* Keep Up To Date Section */}
			<KeepUpToDate />

			{/* Blog CTA Section */}
			<BlogCta
				category="Open Source"
				headline="Ready to build on transparent email?"
				sub="Reloop is Apache 2.0 open-source. Self-host on your servers or start free on reloop.sh."
				primaryLabel="Start Building Free"
				primaryHref="/dashboard/signup"
				secondaryLabel="View on GitHub"
				secondaryHref={socialProfiles.github}
				secondaryExternal
				accentColor="indigo"
			/>
		</>
	);
};

export default WhyOpenSourcePage;
