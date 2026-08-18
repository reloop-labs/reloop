import { SceneHeader } from "../_shared/scene-header";
import { MarketingEmailsPreview } from "./preview";

export function MarketingEmailsSection() {
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
					title="Deliver Broadcasts that Convert"
					description="Upload and sync customer data, orchestrate automated conversion funnels, and monitor engagement analytics with zero deliverability friction."
					ctaLabel="Explore Marketing"
					ctaHref="/docs/marketing"
				/>
			</div>

			<MarketingEmailsPreview />
		</article>
	);
}
