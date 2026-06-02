import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { JsonLd } from "@reloop/web/components/json-ld";
import { communityJsonLd, communitySeo } from "@reloop/web/lib/community-seo";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { CommunityPlatforms } from "./components/community-platforms";

export const metadata = createPageMetadata(communitySeo);

const CommunityPage = () => {
	return (
		<>
			<JsonLd data={communityJsonLd()} />
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
				compactHero
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
		</>
	);
};

export default CommunityPage;
