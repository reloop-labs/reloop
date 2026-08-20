import type { MarketingTabId } from "./preview-scenes";
import { SceneHeader } from "../_shared/scene-header";
import { MarketingEmailsPreview } from "./preview";

export function MarketingEmailsSection({
	activeTab,
	onTabChange,
}: {
	activeTab?: MarketingTabId;
	onTabChange?: (id: MarketingTabId) => void;
} = {}) {
	return (
		<article
			id="email-system-marketing"
			data-scene="marketing"
			className="scroll-mt-28 pt-12 sm:pt-16 lg:pt-16"
		>
			<div className="px-4 sm:px-8 lg:px-12">
				<SceneHeader
					icon="mega-phone"
					color="pink"
					badge="Marketing Emails"
					title="Turn broadcasts into conversions"
					description="Sync your audience, build automated funnels, and measure campaign performance from delivery to conversion."
					ctaLabel="Explore Marketing"
					ctaHref="/docs/marketing"
				/>
			</div>

			<div id="email-stage-marketing">
				<MarketingEmailsPreview
					activeTab={activeTab}
					onTabChange={onTabChange}
				/>
			</div>
		</article>
	);
}
