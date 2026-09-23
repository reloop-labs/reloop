import { cn } from "@reloop/ui/cn";
import { Eye, Lock, ShieldCheck, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";

type FeatureItem = {
	icon: ComponentType<{ className?: string }>;
	title: string;
	description: string;
};

const FEATURES: FeatureItem[] = [
	{
		icon: Eye,
		title: "Stand out in the inbox",
		description:
			"Your logo appears next to every authenticated message, so recipients recognize you before they even open the email.",
	},
	{
		icon: ShieldCheck,
		title: "Trust that fights phishing",
		description:
			"The logo only shows on mail that passes DMARC, making spoofed lookalikes obvious and your brand harder to impersonate.",
	},
	{
		icon: Lock,
		title: "DMARC enforcement included",
		description:
			"BIMI requires DMARC at quarantine or reject, so adopting it hardens your whole domain against spoofing and improves deliverability.",
	},
	{
		icon: TrendingUp,
		title: "Free brand impressions",
		description:
			"Every email you already send becomes a branded impression in supporting inboxes, lifting opens and recall at no per-send cost.",
	},
];

export function BimiBestFeatures() {
	return (
		<section
			id="best-features"
			aria-labelledby="best-features-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					Why BIMI
				</p>
				<h2
					id="best-features-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					Why use BIMI for your domain
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

export const HowItWorksSteps = BimiBestFeatures;
