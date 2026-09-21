import { cn } from "@reloop/ui/cn";
import { Gift, Lock, RotateCw, Zap } from "lucide-react";
import type { ComponentType } from "react";

type FeatureItem = {
	icon: ComponentType<{ className?: string }>;
	title: string;
	description: string;
};

const FEATURES: FeatureItem[] = [
	{
		icon: Lock,
		title: "No key, no account",
		description:
			"The endpoint is public and unauthenticated. It is rate limited per IP, so keep it to signup-time checks rather than bulk list scrubbing.",
	},
	{
		icon: Zap,
		title: "Catalogue plus DNS",
		description:
			"Disposable matching is in-memory. MX is a DNS lookup with a short timeout. We never open an SMTP session, and we do not store addresses.",
	},
	{
		icon: RotateCw,
		title: "List refreshed every 2 hours",
		description:
			"The disposable-domain catalogue holds ~210,000 providers and is re-synced every 2 hours, so brand-new throwaway services get caught too.",
	},
	{
		icon: Gift,
		title: "Free for life, no catch",
		description:
			"This checker is completely free — no signup, no credits, no expiry. Come back and use it as often as you need, for as long as you need.",
	},
];

export function BestFeatures() {
	return (
		<section
			id="best-features"
			aria-labelledby="best-features-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					Best features
				</p>
				<h2
					id="best-features-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					Why Reloop is the best temp email checker.
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
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary-base dark:bg-blue-950/40 dark:text-blue-400">
								<IconComponent className="h-5 w-5 stroke-[1.75]" />
							</div>

							<div className="mt-6 flex items-center gap-2">
								<span
									className="h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base"
									aria-hidden="true"
								/>
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

export const HowItWorksSteps = BestFeatures;
