import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { pricingPlans } from "@reloop/web/lib/pricing";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import type { ReactNode } from "react";

const REPO = "reloop-labs/reloop";

const freeEmails =
	pricingPlans.find((plan) => plan.id === "free")?.comparison.monthlyEmails ??
	"6,000";

function OptionCard({
	title,
	price,
	highlighted,
	children,
	action,
}: {
	title: string;
	price: string;
	highlighted?: boolean;
	children: ReactNode;
	action: ReactNode;
}) {
	return (
		<div
			className={cn(
				"flex flex-col px-4 py-10 sm:px-8 sm:py-12 lg:px-12",
				highlighted && "bg-bg-weak-50/60 dark:bg-white/[0.03]",
			)}
		>
			<div className="flex items-baseline justify-between gap-4">
				<h3 className="font-semibold text-[1.4rem] text-text-strong-950 tracking-tight dark:text-white">
					{title}
				</h3>
				<span className="shrink-0 font-mono text-[12px] text-text-sub-600 dark:text-white/50">
					{price}
				</span>
			</div>
			<p className="mt-4 flex-1 text-pretty text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
				{children}
			</p>
			<div className="mt-8">{action}</div>
		</div>
	);
}

/**
 * "04 · Open source": run Reloop yourself for free, or use Reloop Cloud.
 * `competitorNote` says whether the competitor can be self-hosted.
 */
export function CompareOpenSourceSection({
	competitorNote,
}: {
	competitorNote?: string;
}) {
	return (
		<section className="border-stroke-soft-100 border-b dark:border-white/10">
			<div className="px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
				<span className="font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					04 · Open source
				</span>
				<h2 className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white">
					Self-host it free, or let us run it
				</h2>
				<p className="mt-3 max-w-2xl text-pretty text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
					Reloop is open source under Apache 2.0, with{" "}
					<Link
						href="/license"
						className="text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/25"
					>
						Reloop Labs terms
					</Link>{" "}
					for commercial hosting. The code that runs Reloop Cloud is the code
					you can run.{competitorNote ? ` ${competitorNote}` : ""}
				</p>
			</div>

			<div className="grid divide-stroke-soft-100 border-stroke-soft-100 border-t max-md:divide-y md:grid-cols-2 md:divide-x dark:divide-white/10 dark:border-white/10">
				<OptionCard
					title="Self-host"
					price="Free"
					action={
						<FancyButton.Root
							asChild
							variant="basic"
							size="medium"
							className="h-10 rounded-xl px-4 font-medium text-[14.5px]"
						>
							<a
								href={`https://github.com/${REPO}`}
								target="_blank"
								rel="noreferrer"
							>
								<Icon name="github" className="size-4" />
								{REPO}
							</a>
						</FancyButton.Root>
					}
				>
					Run Reloop on your own servers with Docker or Kubernetes, at no
					licence cost. Community support: you keep it up to date yourself.{" "}
					<Link
						href="/self-host"
						className="text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/25"
					>
						Self-host guide
					</Link>
					.
				</OptionCard>

				<OptionCard
					title="Reloop Cloud"
					price={`${freeEmails} emails / month free`}
					highlighted
					action={
						<FancyButton.Root
							asChild
							variant="neutral"
							size="medium"
							className="h-10 rounded-xl px-4 font-medium text-[14.5px]"
						>
							<a href={hostedSignupHref}>
								Start for free
								<Icon name="arrow-right" className="size-4" />
							</a>
						</FancyButton.Root>
					}
				>
					We run it: sending, IPs, deliverability and updates. Start free with{" "}
					{freeEmails} emails a month, no credit card required. Paid plans add
					dedicated support.
				</OptionCard>
			</div>
		</section>
	);
}
