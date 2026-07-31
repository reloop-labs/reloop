import { JsonLd } from "@reloop/web/components/json-ld";
import {
	FeatureCta,
	MarketingPageShell,
} from "@reloop/web/components/page-shell";
import { glossaryTerms } from "@reloop/web/lib/landing/glossary";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { GlossaryBrowser } from "./components/glossary-browser";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/glossary`;

export const metadata: Metadata = {
	title: "Email Glossary | Reloop",
	description:
		"Browse email infrastructure terms—deliverability, authentication, analytics, and more. Clear definitions for the concepts that show up when you ship email.",
	keywords: [
		"email glossary",
		"email marketing terms",
		"email deliverability glossary",
		"SPF DKIM DMARC explained",
		"email infrastructure terminology",
		"email authentication terms",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email Glossary | Reloop",
		description:
			"Browse email infrastructure terms—deliverability, authentication, analytics, and more.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email Glossary | Reloop",
		description:
			"Browse email infrastructure terms—deliverability, authentication, analytics, and more.",
	},
};

const GlossaryPage = () => {
	const terms = [...glossaryTerms]
		.sort((a, b) =>
			a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
		)
		.map(({ slug, title, description }) => ({ slug, title, description }));

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "DefinedTermSet",
		name: "Email Glossary",
		description:
			"Comprehensive glossary of email marketing and infrastructure terms.",
		url: pageUrl,
		hasDefinedTerm: terms.map((term) => ({
			"@type": "DefinedTerm",
			name: term.title,
			description: term.description,
			url: `${siteUrl}/glossary/${term.slug}`,
			inDefinedTermSet: pageUrl,
		})),
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			{/* No page-level max-width — each section owns its own width. */}
			<div className="pb-16">
				<MarketingPageShell
					titleLines={["Explore email terms."]}
					description="Browse the terms and definitions that show up when you build, send, and debug email infrastructure."
					compactHero
					tightHeroBottom
				>
					<GlossaryBrowser terms={terms} />

					<FeatureCta
						title="Ready to put it into practice?"
						titleMuted="Start free today."
						description="3,000 emails per month on the Free plan—no credit card. Or read the docs and deploy Reloop yourself."
						primary={{
							label: "Get started free",
							href: "/dashboard/signup",
						}}
						secondary={{
							label: "Read documentation",
							href: "/docs",
						}}
						compact
					/>
				</MarketingPageShell>
			</div>
		</>
	);
};

export default GlossaryPage;
