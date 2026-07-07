import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { AboutUsSection } from "./components/about-us-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/company/about-us`;

export const metadata: Metadata = {
	title: "About Reloop Labs | The Team Behind Reloop",
	description:
		"Reloop Labs builds and operates Reloop—open-source email infrastructure you can self-host or use as a hosted service from reloop.sh.",
	keywords: [
		"Reloop Labs",
		"about Reloop",
		"open source email company",
		"email infrastructure team",
		"Reloop company",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "About Reloop Labs | The Team Behind Reloop",
		description:
			"Reloop Labs builds and operates Reloop—open-source email infrastructure you can self-host or use as a hosted service.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "About Reloop Labs | The Team Behind Reloop",
		description:
			"Reloop Labs builds and operates Reloop—open-source email infrastructure you can self-host or use as a hosted service.",
	},
};

const AboutUsPage = () => {
	return (
		<MarketingPageShell
			titleLines={["About", "Reloop Labs."]}
			description="We're the company behind Reloop. We maintain the open-source codebase, operate the hosted service at reloop.sh, and build in public with the community."
			primaryCta={{
				label: "Contact us",
				href: "/company/contact-us",
			}}
			secondaryCta={{
				label: "View on GitHub",
				href: socialProfiles.github,
				external: true,
			}}
			fullViewportHero
		>
			<PageSection flushTop>
				<AboutUsSection />
			</PageSection>

			<FeatureCta
				title="Work with us"
				titleMuted="in the open."
				description="Use Reloop hosted, self-host the codebase, or contribute on GitHub—the same platform, your choice of deployment."
				primary={{
					label: "Start sending free",
					href: "/dashboard/signup",
				}}
				secondary={{
					label: "Join Discord",
					href: socialProfiles.discord,
					external: true,
				}}
				compact
			/>
		</MarketingPageShell>
	);
};

export default AboutUsPage;
