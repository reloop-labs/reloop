"use client";

import { cn } from "@reloop/ui/cn";
import { useState } from "react";
import { PricingCreditsSection } from "./pricing-credits-section";
import { CreditsVolumeSlider } from "./pricing-credits-slider";
import { usePricingUi } from "./pricing-cta";
import { PricingSection } from "./pricing-section";
import {
	PricingVolumeSlider,
	recommendPlanIdForVolume,
} from "./pricing-volume-slider";

export type PricingBillingMode = "monthly" | "credits";
type BillingMode = PricingBillingMode;

const billingTabs: Array<{
	id: BillingMode;
	label: string;
	description: string;
}> = [
	{
		id: "monthly",
		label: "Monthly plan",
		description: "Renews monthly. Best for steady sending.",
	},
	{
		id: "credits",
		label: "Pay as you go",
		description: "Pay once, no subscription. Credits last 6 months.",
	},
];

export function PricingExplorer({
	initialMode = "monthly",
}: {
	initialMode?: BillingMode;
} = {}) {
	const { Section } = usePricingUi();
	const [monthlyVolume, setMonthlyVolume] = useState(50000);
	const [creditsVolume, setCreditsVolume] = useState(10000);
	const [mode, setMode] = useState<BillingMode>(initialMode);

	return (
		<>
			<div className="w-full border-stroke-soft-100 border-y dark:border-white/10">
				<div
					role="tablist"
					aria-label="Billing mode"
					className="mx-auto grid w-full grid-cols-2 divide-x divide-stroke-soft-100 border-stroke-soft-100 lg:w-1/2 lg:border-x dark:divide-white/10 dark:border-white/10"
				>
					{billingTabs.map((tab) => {
						const active = mode === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setMode(tab.id)}
								className={cn(
									"flex items-start gap-3 px-5 py-5 text-left transition-colors duration-200 sm:px-7 sm:py-6",
									active
										? "bg-bg-weak-50 dark:bg-white/[0.04]"
										: "hover:bg-bg-weak-50/60 dark:hover:bg-white/[0.02]",
								)}
							>
								<span
									aria-hidden
									className={cn(
										"mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
										active
											? "border-stroke-strong-950 dark:border-white"
											: "border-stroke-soft-300 dark:border-white/25",
									)}
								>
									<span
										className={cn(
											"size-2 rounded-full bg-bg-strong-950 transition-transform duration-200 dark:bg-white",
											active ? "scale-100" : "scale-0",
										)}
									/>
								</span>
								<span className="flex flex-col gap-1">
									<span className="font-medium text-[14.5px] text-text-strong-950 leading-tight dark:text-white">
										{tab.label}
									</span>
									<span className="text-[13px] text-text-sub-600 leading-snug dark:text-white/55">
										{tab.description}
									</span>
								</span>
							</button>
						);
					})}
				</div>
			</div>
			{mode === "monthly" ? (
				<>
					<PricingVolumeSlider
						volume={monthlyVolume}
						onVolumeChange={setMonthlyVolume}
					/>
					<Section>
						<PricingSection
							recommendedPlanId={recommendPlanIdForVolume(monthlyVolume)}
							volume={monthlyVolume}
						/>
					</Section>
				</>
			) : (
				<>
					<CreditsVolumeSlider
						volume={creditsVolume}
						onVolumeChange={setCreditsVolume}
					/>
					<Section>
						<PricingCreditsSection volume={creditsVolume} />
					</Section>
				</>
			)}
		</>
	);
}
