"use client";

import { cn } from "@reloop/ui/cn";
import { PageSection } from "@reloop/web/components/page-shell";
import { useState } from "react";
import { PricingCreditsSection } from "./pricing-credits-section";
import { CreditsVolumeSlider } from "./pricing-credits-slider";
import { PricingSection } from "./pricing-section";
import {
	PricingVolumeSlider,
	recommendPlanIdForVolume,
} from "./pricing-volume-slider";

type BillingMode = "monthly" | "credits";

const billingTabs: Array<{
	id: BillingMode;
	label: string;
	description: [string, string];
}> = [
	{
		id: "monthly",
		label: "Monthly",
		description: [
			"A plan that renews every month.",
			"Best for steady, ongoing sending.",
		],
	},
	{
		id: "credits",
		label: "Credits",
		description: [
			"Pay once, no subscription.",
			"Credits last 6 months, use them as you need.",
		],
	},
];

export function PricingExplorer() {
	const [monthlyVolume, setMonthlyVolume] = useState(50000);
	const [creditsVolume, setCreditsVolume] = useState(10000);
	const [mode, setMode] = useState<BillingMode>("monthly");

	return (
		<>
			<div className="flex w-full flex-col items-center gap-4 px-6 sm:px-8">
				<div
					role="tablist"
					aria-label="Billing mode"
					className="inline-flex rounded-full border border-stroke-soft-200 bg-bg-weak-50 p-1 dark:border-white/10 dark:bg-white/[0.04]"
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
									"h-9 rounded-full px-6 font-medium text-[13.5px] transition-all duration-200",
									active
										? "bg-bg-strong-950 text-text-white-0 shadow-fancy-buttons-neutral"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white",
								)}
							>
								{tab.label}
							</button>
						);
					})}
				</div>
				<p className="text-center text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
					{billingTabs
						.find((tab) => tab.id === mode)
						?.description.map((line) => (
							<span key={line} className="block">
								{line}
							</span>
						))}
				</p>
			</div>
			{mode === "monthly" ? (
				<>
					<PricingVolumeSlider
						volume={monthlyVolume}
						onVolumeChange={setMonthlyVolume}
					/>
					<PageSection flushTop flushBottom>
						<PricingSection
							recommendedPlanId={recommendPlanIdForVolume(monthlyVolume)}
							volume={monthlyVolume}
						/>
					</PageSection>
				</>
			) : (
				<>
					<CreditsVolumeSlider
						volume={creditsVolume}
						onVolumeChange={setCreditsVolume}
					/>
					<PageSection flushTop flushBottom>
						<PricingCreditsSection volume={creditsVolume} />
					</PageSection>
				</>
			)}
		</>
	);
}
