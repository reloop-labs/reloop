import { cn } from "@reloop/ui/cn";
import { CalendarSearch, Clock, ShieldCheck, Zap } from "lucide-react";
import type { ComponentType } from "react";

type FeatureItem = {
	icon: ComponentType<{ className?: string }>;
	title: string;
	description: string;
};

const FEATURES: FeatureItem[] = [
	{
		icon: Zap,
		title: "100% free, instant results",
		description:
			"No account, credit card, or API key needed. Check any domain in under a second with zero friction.",
	},
	{
		icon: CalendarSearch,
		title: "Verified registration date",
		description:
			"We pull official registry records directly — not outdated WHOIS caches — so your domain's exact creation date is always accurate.",
	},
	{
		icon: Clock,
		title: "Email warmup timeline",
		description:
			"Know exactly when it's safe to send: Too New (0–7 days), Cold (8–30 days), Warming (31–90 days), or Established (90+ days).",
	},
	{
		icon: ShieldCheck,
		title: "Spam filter risk check",
		description:
			"Instantly see if mailbox providers like Gmail and Outlook treat your domain as high-risk before you start sending emails.",
	},
];

function AccentBar() {
	return (
		<span
			className="h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base"
			aria-hidden="true"
		/>
	);
}

export function WhyDomainAgeMatters() {
	return (
		<section
			id="why-domain-age-matters"
			aria-labelledby="why-domain-age-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					Why it matters
				</p>
				<h2
					id="why-domain-age-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					Why domain age affects email deliverability
				</h2>
			</div>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{FEATURES.map((feature, index) => {
					const borderClass =
						index === 0
							? "border-b sm:border-r lg:border-b-0 lg:border-r"
							: index === 1
								? "border-b sm:border-r-0 lg:border-b-0 lg:border-r"
								: index === 2
									? "border-b sm:border-b-0 sm:border-r lg:border-b-0 lg:border-r"
									: "border-b-0 sm:border-b-0 sm:border-r-0 lg:border-r-0";

					const IconComponent = feature.icon;

					return (
						<div
							key={feature.title}
							className={cn(
								"flex flex-col border-stroke-soft-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10",
								borderClass,
							)}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-neutral-100 text-neutral-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-neutral-400">
								<IconComponent className="h-5 w-5 stroke-[1.75]" />
							</div>

							<div className="mt-6 flex items-center gap-2">
								<AccentBar />
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									{feature.title}
								</h3>
							</div>

							<p className="mt-3 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
								{feature.description}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
