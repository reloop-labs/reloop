import { SceneHeader } from "../_shared/scene-header";
import { EmailAnalyticsPreview } from "./preview";

export function EmailAnalyticsSection() {
	return (
		<article
			id="email-system-analytics"
			data-scene="analytics"
			className="scroll-mt-28 pt-12 sm:pt-16 lg:pt-16"
		>
			<div className="px-4 sm:px-8 lg:px-12">
				<SceneHeader
					icon="fat-row"
					color="blue"
					badge="Email Analytics"
					title="See exactly what happens to every email."
					description="Get a complete view of delivery, engagement, reputation, and failures, from the moment you hit send."
					ctaLabel="Explore Analytics"
					ctaHref="/docs/analytics"
				/>
			</div>

			<EmailAnalyticsPreview />
		</article>
	);
}
