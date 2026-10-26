import * as FancyButton from "@reloop/ui/fancy-button";
import { pricingPlans } from "@reloop/web/lib/pricing";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import { costsCheckedAt } from "../compare-hero-costs";

const freeEmails =
	pricingPlans.find((plan) => plan.id === "free")?.comparison.monthlyEmails ??
	"6,000";

export function CompareHeroHeader() {
	return (
		<header className="w-full border-stroke-soft-100 border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="flex flex-col items-center px-4 pt-28 pb-16 text-center sm:px-8 sm:pt-40 sm:pb-20 lg:px-12">
				<h1 className="max-w-4xl text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.1rem] dark:text-white">
					Reloop next to the email platforms you know.
				</h1>

				<p className="mt-4 max-w-[42rem] text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] dark:text-white/60">
					Prices from each platform&apos;s pricing page in {costsCheckedAt}, for
					transactional sending and marketing lists. Reloop bills per email
					sent, keeps contacts unlimited, and is open source.
				</p>

				<div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9 sm:gap-4">
					<FancyButton.Root
						asChild
						variant="neutral"
						size="medium"
						className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
					>
						<a href={hostedSignupHref}>Start for free</a>
					</FancyButton.Root>
					<FancyButton.Root
						asChild
						variant="basic"
						size="medium"
						className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
					>
						<Link href="/pricing">See pricing</Link>
					</FancyButton.Root>
				</div>
				<p className="mt-3.5 text-[12.5px] text-text-sub-600 sm:text-[13.5px] dark:text-white/50">
					Free plan: {freeEmails} emails a month. No credit card.
				</p>
			</div>
		</header>
	);
}
