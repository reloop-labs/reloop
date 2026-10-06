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

const billingTabs: Array<{ id: BillingMode; label: string }> = [
	{ id: "credits", label: "Credits" },
	{ id: "monthly", label: "Monthly" },
];

export function PricingExplorer() {
	const [volume, setVolume] = useState(100000);
	const [mode, setMode] = useState<BillingMode>("credits");

	return (
		<>
			<div className="flex w-full justify-center border-stroke-soft-100 border-t px-6 pt-10 sm:px-8 sm:pt-12 dark:border-white/10">
				<div
					role="tablist"
					aria-label="Billing mode"
					className="inline-flex rounded-full border border-stroke-soft-200 bg-bg-weak-50 p-1 dark:border-white/10 dark:bg-white/[0.04]"
				>
					{" "}
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
			</div>
			{mode === "monthly" ? (
				<>
					<PricingVolumeSlider volume={volume} onVolumeChange={setVolume} />
					<PageSection flushTop flushBottom>
						<PricingSection
							recommendedPlanId={recommendPlanIdForVolume(volume)}
							volume={volume}
						/>
					</PageSection>
				</>
			) : (
				<>
					<CreditsVolumeSlider volume={volume} onVolumeChange={setVolume} />
					<PageSection flushTop flushBottom>
						<PricingCreditsSection volume={volume} />
					</PageSection>
				</>
			)}
		</>
	);
}
