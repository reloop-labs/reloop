import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import { BrandIcon, type BrandMark } from "./brand-icon";

/** "Moving from X?" card: what switching takes, the migration guide, and both logos. */
export function CompareMigrateBanner({
	competitorName,
	icon,
	guideHref,
}: {
	competitorName: string;
	icon?: BrandMark;
	guideHref: string;
}) {
	return (
		<section className="bg-bg-weak-50/60 px-4 py-20 sm:px-8 sm:py-24 lg:px-12 dark:bg-white/[0.03]">
			<div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
				<div className="max-w-xl">
					<h2 className="text-balance font-semibold text-[1.9rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.3rem] dark:text-white">
						Moving from {competitorName}?
					</h2>
					<p className="mt-4 text-pretty text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
						Verify your domain, swap the send call, and point your webhooks at
						Reloop. Keep {competitorName} running while you ramp traffic over,
						so nothing breaks.
					</p>
					<div className="mt-7 flex flex-wrap gap-3">
						<FancyButton.Root
							asChild
							variant="neutral"
							size="medium"
							className="h-10 rounded-xl px-5 font-medium text-[14.5px]"
						>
							<Link href={guideHref}>
								Read the migration guide
								<Icon name="arrow-right" className="size-4" />
							</Link>
						</FancyButton.Root>
						<FancyButton.Root
							asChild
							variant="basic"
							size="medium"
							className="h-10 rounded-xl px-5 font-medium text-[14.5px]"
						>
							<a href={hostedSignupHref}>Get started</a>
						</FancyButton.Root>
					</div>
				</div>

				{/* Above the copy on phones; centred in the right half rather than pushed to the edge on desktop. */}
				<div
					aria-hidden
					className="order-first flex items-center gap-4 sm:gap-8 lg:order-none lg:justify-center"
				>
					<span className="flex items-center gap-2.5 font-semibold text-[1.4rem] text-text-strong-950 tracking-tight sm:gap-3 sm:text-[1.75rem] lg:text-[2rem] dark:text-white">
						{icon ? (
							<BrandIcon
								icon={icon}
								fill="currentColor"
								className="size-6 text-text-strong-950 sm:size-9 dark:text-white"
							/>
						) : null}
						{competitorName}
					</span>
					<Icon
						name="arrow-right"
						className="size-5 shrink-0 text-text-sub-600 sm:size-7 dark:text-white/40"
					/>
					<span className="flex items-center gap-2.5 font-semibold text-[1.4rem] text-text-strong-950 tracking-tight sm:gap-3 sm:text-[1.75rem] lg:text-[2rem] dark:text-white">
						<span className="flex size-8 items-center justify-center overflow-hidden sm:size-11">
							<Logo className="size-11 shrink-0 sm:size-16" />
						</span>
						Reloop
					</span>
				</div>
			</div>
		</section>
	);
}
