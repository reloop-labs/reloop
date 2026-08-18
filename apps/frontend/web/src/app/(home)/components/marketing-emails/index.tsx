import { SceneHeader } from "../_shared/scene-header";

export function MarketingEmailsSection() {
	return (
		<article
			id="email-system-marketing"
			data-scene="marketing"
			className="scroll-mt-28 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-16"
		>
			<SceneHeader
				icon="mega-phone"
				iconBgColor="bg-pink-600"
				badge="Reloop Marketing"
				title="Reach your audience without spam flags."
				description="Send broadcasts and newsletters with audience segmentation, warm-up protection, and high inbox delivery."
				ctaLabel="Explore Marketing"
				ctaHref="/docs/marketing"
			/>

			<div className="relative mt-10 min-h-[20rem] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:min-h-[24rem] dark:border-white/10 dark:bg-black">
				{/* Marketing emails visual content */}
			</div>
		</article>
	);
}
