import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import type { Metadata } from "next";
import { CommunityPlatforms } from "./components/community-platforms";

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
			description="Help us build open-source email infrastructure from the ground up."
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

			<FeatureCta
				title="Ready to join?"
				titleMuted="We'd love to meet you."
				highlightTitleMuted
				description="We're a small team in the early days—whether you want to contribute code, report issues, or simply follow along, you're welcome here."
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
