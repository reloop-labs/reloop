import { JsonLd } from "@reloop/web/components/json-ld";
import { FeatureCta } from "@reloop/web/components/page-shell";
import { communityJsonLd, communitySeo } from "@reloop/web/lib/community-seo";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { CommunityPlatforms } from "./components/community-platforms";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = createPageMetadata({ ...communitySeo, ogImage: false });

const CommunityPage = () => {
	return (
		<>
			<JsonLd data={communityJsonLd()} />
			<section>
				<div className="mx-auto max-w-[1320px] px-4 pt-32 pb-16 sm:px-6 sm:pt-36 sm:pb-20 lg:px-8 lg:pb-24">
					<CommunityPlatforms />
				</div>
			</section>

			<FeatureCta
				title="Ready to join?"
				titleMuted="We'd love to meet you."
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
		</>
	);
};

export default CommunityPage;
