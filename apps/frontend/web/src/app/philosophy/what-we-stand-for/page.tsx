import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { WhatWeStandForSection } from "./components/what-we-stand-for-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/philosophy/what-we-stand-for";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "What We Stand For | Reloop",
	description:
		"Six principles behind Reloop: open source, developer-first design, and email infrastructure you can audit, self-host, and trust.",
	keywords: [
		"Reloop values",
		"open source values",
		"company principles",
		"email infrastructure values",
		"developer-first company",
		"transparent software company",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "What We Stand For | Reloop",
		description:
			"Six principles behind Reloop—open source, developer-first design, and infrastructure you can audit and self-host.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "What We Stand For | Reloop",
		description:
			"Six principles behind Reloop—open source, developer-first design, and infrastructure you can audit and self-host.",
	},
};

const WhatWeStandForPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Values we ship by.", "Not values we slide by."]}
			description="Reloop is open-source email infrastructure. These six principles decide what we build, what we open-source, and what we refuse to compromise on."
			primaryCta={{
				label: "Why we're open source",
				href: "/philosophy/why-open-source",
			}}
			secondaryCta={{
				label: "Meet the team",
				href: "/company/about-us",
			}}
			fullViewportHero
		>
			<PageSection flushTop>
				<WhatWeStandForSection />
			</PageSection>

			<FeatureCta
				title="See the principles in code"
				titleMuted="not a slide deck."
				description="3,000 emails per month free—or clone the repo and run Reloop on infrastructure you control."
				primary={{
					label: "Start sending free",
					href: "/dashboard/signup",
				}}
				secondary={{
					label: "View on GitHub",
					href: socialProfiles.github,
					external: true,
				}}
				compact
			/>
		</MarketingPageShell>
	);
};

export default WhatWeStandForPage;
