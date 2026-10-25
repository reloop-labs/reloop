import { Icon } from "@reloop/ui/icon";
import {
	formatPrice,
	paidOverageUsdPerThousand,
	pricingPlans,
} from "@reloop/web/lib/pricing";
import { testimonials } from "@reloop/web/lib/testimonials";
import Link from "next/link";

const QUOTE_HIGHLIGHT = "infinitely better";

const freePlan = pricingPlans.find((plan) => plan.id === "free");
const growthPlan = pricingPlans.find((plan) => plan.id === "startup");

const STATS = [
	{
		value: formatPrice(growthPlan?.monthlyPrice ?? 20),
		label: "for 100,000 emails a month",
	},
	{ value: "$0", label: "per contact you store" },
	{
		value: `$${paidOverageUsdPerThousand.toFixed(2)}`,
		label: "per 1,000 emails after that",
	},
];

function handleFromUrl(url?: string): string | null {
	const match = url?.match(/x\.com\/([^/]+)/);
	return match?.[1] ? `@${match[1]}` : null;
}

export function MarketingProof() {
	const featured =
		testimonials.find((t) => t.quote.includes(QUOTE_HIGHLIGHT)) ??
		testimonials[0];
	if (!featured) return null;

	const [before, after] = featured.quote.split(QUOTE_HIGHLIGHT);
	const handle = handleFromUrl(featured.sourceUrl);

	return (
		<section
			aria-label="What developers say"
			className="flex flex-col items-center px-4 py-20 text-center sm:px-8 sm:py-28 lg:px-12"
		>
			<figure className="flex max-w-3xl flex-col items-center">
				<blockquote className="text-balance font-medium text-[1.6rem] text-text-strong-950 leading-[1.25] tracking-[-0.03em] sm:text-[2.25rem] dark:text-white">
					&ldquo;{before}
					{after !== undefined ? (
						<>
							<span className="bg-[linear-gradient(transparent_62%,var(--mark)_62%,var(--mark)_92%,transparent_92%)] [--mark:var(--color-stroke-soft-200)] dark:[--mark:rgba(255,255,255,0.15)]">
								{QUOTE_HIGHLIGHT}
							</span>
							{after}
						</>
					) : null}
					&rdquo;
				</blockquote>
				<figcaption className="mt-7 flex items-center gap-3 text-[15px]">
					{featured.avatarUrl ? (
						<img
							src={featured.avatarUrl}
							alt=""
							aria-hidden
							className="size-9 shrink-0 rounded-full object-cover"
						/>
					) : null}
					<span className="font-medium text-text-strong-950 dark:text-white">
						{featured.name}
					</span>
					{handle ? (
						<span className="text-text-sub-600 dark:text-white/50">
							{handle}
						</span>
					) : null}
					{featured.sourceUrl ? (
						<a
							href={featured.sourceUrl}
							target="_blank"
							rel="noreferrer"
							aria-label={`View ${featured.name}'s post on X`}
							className="text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							<Icon name="social-x" className="size-4" />
						</a>
					) : null}
				</figcaption>
			</figure>

			<div className="mt-16 grid w-full max-w-4xl grid-cols-1 divide-y divide-stroke-soft-100 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] sm:mt-20 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
				{STATS.map((stat) => (
					<div key={stat.label} className="px-6 py-8 sm:py-10">
						<p className="font-semibold text-[2.75rem] text-text-strong-950 tabular-nums leading-none tracking-[-0.04em] sm:text-[3.25rem] dark:text-white">
							{stat.value}
						</p>
						<p className="mt-3 text-[14px] text-text-sub-600 sm:text-[15px] dark:text-white/50">
							{stat.label}
						</p>
					</div>
				))}
			</div>
			<p className="mt-5 text-[13.5px] text-text-sub-600 dark:text-white/50">
				{(freePlan?.emailsLabel ?? "6,000 emails / month").replace(
					" / ",
					" a ",
				)}{" "}
				free.{" "}
				<Link
					href="/pricing"
					className="font-medium text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-4 dark:text-white dark:decoration-white/20"
				>
					See all the numbers
				</Link>
			</p>
		</section>
	);
}
