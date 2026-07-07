import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { WhyReloopSection } from "./components/why-reloop-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/philosophy/why-reloop`;

export const metadata: Metadata = {
	title: "Why Reloop | Open-Source Email Infrastructure",
	description:
		"Proprietary-grade email without vendor lock-in. Reloop is open-source, self-hostable infrastructure—use it hosted or deploy it on your servers.",
	keywords: [
		"why Reloop",
		"open source email",
		"self-hosted email",
		"email vendor lock-in",
		"email infrastructure alternative",
		"transparent email platform",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Why Reloop | Open-Source Email Infrastructure",
		description:
			"Proprietary-grade email without vendor lock-in. Hosted by Reloop Labs or self-hosted on your infrastructure.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Why Reloop | Open-Source Email Infrastructure",
		description:
			"Proprietary-grade email without vendor lock-in. Hosted by Reloop Labs or self-hosted on your infrastructure.",
	},
};

const WhyReloopPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Proprietary-grade email.", "Without the lock-in."]}
			description="Reloop gives you transactional email, campaigns, SMTP, and analytics—the same stack as closed platforms, with open-source code you can read, fork, and run on your own servers."
			primaryCta={{
				label: "Start sending free",
				href: "/dashboard/signup",
			}}
			secondaryCta={{
				label: "Read self-hosting guide",
				href: "/docs/self-host",
			}}
			fullViewportHero
		>
			<PageSection flushTop>
				<WhyReloopSection />
			</PageSection>

			<FeatureCta
				title="Try it free"
				titleMuted="or run it yourself."
				description="3,000 emails per month on the Free plan—no credit card. Or clone the repo and deploy Reloop on infrastructure you control."
				primary={{
					label: "Start sending free",
					href: "/dashboard/signup",
				}}
				secondary={{
					label: "Read self-hosting guide",
					href: "/docs/self-host",
				}}
				compact
			/>
		</MarketingPageShell>
	);
};

export default WhyReloopPage;
