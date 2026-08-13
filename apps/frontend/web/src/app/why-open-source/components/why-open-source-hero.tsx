import * as Button from "@reloop/ui/button";
import { socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";

export function WhyOpenSourceHero() {
	return (
		<section className="relative w-full max-w-full overflow-x-clip border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center border-stroke-soft-200 px-6 pt-28 pb-16 text-center sm:px-10 sm:pt-32 sm:pb-20 md:max-w-7xl lg:items-start lg:px-12 lg:text-left xl:border-x dark:border-white/10">
				{/* Main Headline */}
				<h1 className="max-w-4xl font-semibold text-xl text-balance text-text-strong-950 leading-snug tracking-tight sm:text-4xl sm:leading-[1.15] lg:text-[2.6rem] dark:text-white">
					Our mission is to make email infrastructure open, auditable, and self-hostable.
				</h1>

				{/* Subheadline / Description */}
				<p className="mx-auto mt-3 max-w-2xl text-[14px] text-balance text-text-sub-600 leading-relaxed sm:mt-4 sm:text-[16px] lg:mx-0 dark:text-white/60">
					Reloop is built under Apache 2.0. We believe routing rules, deliverability logic, and transmission pipelines belong in public source code, not closed black boxes.
				</p>

				{/* Hero Actions */}
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
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
						href="/docs/self-host"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()} inline-flex h-9! rounded-full! px-5! font-medium text-xs! sm:h-10! sm:px-6! sm:text-sm!`}
					>
						Self-hosting guide
					</Link>
				</div>
			</div>
		</section>
	);
}
