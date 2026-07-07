import { JsonLd } from "@reloop/web/components/json-ld";
import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { EngineeringSection } from "./components/engineering-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/philosophy/engineering";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Engineering Excellence | Reloop",
	description:
		"Our technical philosophy emphasizes reliability, performance, and maintainability. Learn how Reloop is built with modern engineering practices at every level of the stack.",
	keywords: [
		"engineering philosophy",
		"email infrastructure architecture",
		"reliable email delivery",
		"open source engineering",
		"Reloop technical stack",
		"email platform engineering",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Engineering Excellence | Reloop",
		description:
			"Our technical philosophy emphasizes reliability, performance, and maintainability at every level of the stack.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Engineering Excellence | Reloop",
		description:
			"Our technical philosophy emphasizes reliability, performance, and maintainability at every level of the stack.",
	},
};

const EngineeringPage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"@id": `${pageUrl}#webpage`,
		url: pageUrl,
		name: "Engineering Excellence | Reloop",
		description:
			"Our technical philosophy emphasizes reliability, performance, and maintainability at every level of the stack.",
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
			<MarketingPageShell
				titleLines={[
					"Engineering excellence.",
					"Built to last at scale.",
				]}
				description="Great products are built by great engineering. Our technical philosophy emphasizes reliability, performance, and maintainability at every level of the stack."
				primaryCta={{
					label: "View on GitHub",
					href: socialProfiles.github,
					external: true,
				}}
				secondaryCta={{
					label: "Join our team",
					href: "/careers",
				}}
				compactHero
			>
				<PageSection flushTop>
					<EngineeringSection />
				</PageSection>

				<FeatureCta
					title="Help us build the future"
					titleMuted="of email infrastructure."
					description="We're looking for engineers who share our passion for reliability, performance, and open source. Explore our codebase or get in touch."
					primary={{
						label: "Get in touch",
						href: "/careers",
					}}
					secondary={{
						label: "Explore our code",
						href: socialProfiles.github,
						external: true,
					}}
					compact
				/>
			</MarketingPageShell>
		</>
	);
};

export default EngineeringPage;
