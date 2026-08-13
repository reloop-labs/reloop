import * as Button from "@reloop/ui/button";
import { socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";

export function AboutHero() {
	return (
		<section className="relative w-full max-w-full overflow-x-clip border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center border-stroke-soft-200 px-6 pt-28 pb-14 text-center sm:px-10 sm:pt-32 sm:pb-16 md:max-w-7xl lg:items-start lg:px-12 lg:text-left xl:border-x dark:border-white/10">
				{/* Main Headline */}
				<h1 className="max-w-4xl font-semibold text-xl text-balance text-text-strong-950 leading-snug tracking-tight sm:text-4xl sm:leading-[1.15] lg:text-[2.6rem] dark:text-white">
					We built the email infrastructure we couldn&apos;t buy.
				</h1>

				{/* Subheadline / Description */}
				<p className="mx-auto mt-3 max-w-2xl text-[14px] text-balance text-text-sub-600 leading-relaxed sm:mt-4 sm:text-[16px] lg:mx-0 dark:text-white/60">
					We started Reloop Labs to build email infrastructure you actually control. Send transactional messages, run marketing campaigns, and track deliverability from our managed hosted platform or your own servers.
				</p>

				{/* Action Buttons */}
				<div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
					<a
						href={socialProfiles.github}
						target="_blank"
						rel="noopener noreferrer"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "filled",
						}).root()} inline-flex h-9! rounded-full! px-5! font-medium text-xs! sm:h-10! sm:px-6! sm:text-sm! dark:bg-white dark:text-black dark:hover:bg-white/90`}
					>
						View on GitHub
					</a>
					<Link
						href="/philosophy/why-open-source"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()} inline-flex h-9! rounded-full! px-5! font-medium text-xs! sm:h-10! sm:px-6! sm:text-sm!`}
					>
						Why Open Source
					</Link>
				</div>

				{/* Key Company Facts Strip */}
				<div className="mt-10 w-full overflow-hidden border border-stroke-soft-200 divide-y divide-stroke-soft-200 sm:grid sm:grid-cols-4 sm:divide-x sm:divide-y-0 dark:border-white/10 dark:divide-white/10">
					<div className="p-5 sm:p-6">
						<p className="font-medium text-[12px] text-text-sub-600 dark:text-white/50">
							Founded
						</p>
						<p className="mt-1 font-semibold text-[20px] text-text-strong-950 tracking-tight dark:text-white">
							2025
						</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 dark:text-white/45">
							Public from commit zero
						</p>
					</div>
					<div className="p-5 sm:p-6">
						<p className="font-medium text-[12px] text-text-sub-600 dark:text-white/50">
							Leadership
						</p>
						<p className="mt-1 font-semibold text-[20px] text-text-strong-950 tracking-tight dark:text-white">
							Engineer-led
						</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 dark:text-white/45">
							Founders write the code
						</p>
					</div>
					<div className="p-5 sm:p-6">
						<p className="font-medium text-[12px] text-text-sub-600 dark:text-white/50">
							License
						</p>
						<p className="mt-1 font-semibold text-[20px] text-text-strong-950 tracking-tight dark:text-white">
							Apache 2.0
						</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 dark:text-white/45">
							Single public monorepo
						</p>
					</div>
					<div className="p-5 sm:p-6">
						<p className="font-medium text-[12px] text-text-sub-600 dark:text-white/50">
							Hosted platform
						</p>
						<p className="mt-1 font-semibold text-[20px] text-text-strong-950 tracking-tight dark:text-white">
							reloop.sh
						</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 dark:text-white/45">
							Global edge delivery
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
