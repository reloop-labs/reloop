import { SceneHeader } from "../_shared/scene-header";

export function EmailAnalyticsSection() {
	return (
		<article
			id="email-system-analytics"
			data-scene="analytics"
			className="scroll-mt-28 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-16"
		>
			<SceneHeader
				icon="graph-up"
				iconBgColor="bg-blue-600"
				badge="Reloop Analytics"
				title="Opens, clicks, bounces — as they happen."
				description="A live console for the mail you just sent. Track real-time delivery and reputation without waiting on daily dumps."
				ctaLabel="Explore Analytics"
				ctaHref="/docs/analytics"
			/>

			<div className="relative mt-10 min-h-[20rem] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:min-h-[24rem] dark:border-white/10 dark:bg-black">
				{/* Email analytics visual content */}
			</div>
		</article>
	);
}
