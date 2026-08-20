import { FeatureHighlightsGrid } from "@reloop/web/components/landing/feature-highlights";

export function CompareHeroHeader() {
	return (
		<div className="w-full border-stroke-soft-200 border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="px-6 pt-28 pb-14 text-left sm:px-10 sm:pt-32 sm:pb-16 lg:px-12">
				<h1 className="max-w-3xl font-semibold text-3xl text-text-strong-950 leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.6rem] dark:text-white">
					Reloop vs the competition.
				</h1>

				<p className="mt-4 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
					Compare Reloop against leading email service providers. Learn how
					Reloop delivers 10x lower costs, open-source transparency, and unified
					email infrastructure.
				</p>
			</div>

			<div className="border-stroke-soft-200 border-t dark:border-white/10">
				<FeatureHighlightsGrid />
			</div>
		</div>
	);
}
