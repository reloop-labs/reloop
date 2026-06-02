import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import type { Metadata } from "next";
import { CommunityPlatforms } from "./components/community-platforms";
import { CommunityStats } from "./components/community-stats";

export const metadata: Metadata = {
	title: "Community | Reloop",
	description:
		"Join the Reloop community on Discord, GitHub, and social channels. Connect with developers building open-source email infrastructure.",
	openGraph: {
		title: "Community | Reloop",
		description:
			"Join the Reloop community on Discord, GitHub, and social channels.",
		type: "website",
	},
};

const CommunityPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Join the Reloop", "Community"]}
			description="Connect with developers, share knowledge, and help shape the future of email infrastructure."
			primaryCta={{
				label: "Join Discord",
				href: "https://discord.gg/bHnkBcp7xR",
			}}
			secondaryCta={{
				label: "Contribute on GitHub",
				href: "https://github.com/reloop-labs/reloop",
			}}
		>
			<PageSection>
				<CommunityPlatforms />
			</PageSection>

			<PageSection alt>
				<SectionHeading
					title="A growing community"
					description="Thousands of developers are already part of the Reloop ecosystem."
				/>
				<CommunityStats />
			</PageSection>

			<FeatureCta
				title="Ready to join?"
				titleMuted="We'd love to meet you."
				description="Whether you need help, want to contribute code, or connect with peers—there's a place for you."
				primary={{
					label: "Join Discord",
					href: "https://discord.gg/bHnkBcp7xR",
				}}
				secondary={{
					label: "Star on GitHub",
					href: "https://github.com/reloop-labs/reloop",
				}}
			/>
		</MarketingPageShell>
	);
};

export default CommunityPage;
