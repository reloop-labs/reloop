"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { useState } from "react";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "../components/brand-icon";

const CONTACT_TIERS = [
	{ contacts: 5000, loops: 49, reloop: 10, emailsSentEstimate: 15000 },
	{ contacts: 10000, loops: 49, reloop: 10, emailsSentEstimate: 25000 },
	{ contacts: 25000, loops: 99, reloop: 20, emailsSentEstimate: 50000 },
	{ contacts: 50000, loops: 199, reloop: 20, emailsSentEstimate: 75000 },
	{ contacts: 100000, loops: 399, reloop: 45, emailsSentEstimate: 150000 },
];

export function LoopsCostCalculator() {
	const [selectedTierIndex, setSelectedTierIndex] = useState<number>(2); // Default 25k contacts

	const current = CONTACT_TIERS[selectedTierIndex] ?? CONTACT_TIERS[2]!;
	const loopsIcon = competitorBrands.find((b) => b.name === "Loops")?.icon;

	const annualSavings = (current.loops - current.reloop) * 12;
	const formatNum = (n: number) => new Intl.NumberFormat("en-US").format(n);

	return (
		<div className="w-full rounded-3xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-6 sm:p-10 dark:border-white/10 dark:bg-white/[0.02]">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
				{/* Left Side Controls */}
				<div className="flex-1 space-y-5">
					<div>
						<span className="font-bold text-[12px] text-text-sub-600 uppercase tracking-widest dark:text-white/50">
							Contact Penalty vs Send Pricing
						</span>
						<h3 className="mt-1 font-serif text-[1.8rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.2rem] dark:text-white">
							Why pay for inactive contacts?
						</h3>
						<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Loops increases your monthly bill whenever your contact list
							grows. Reloop charges only for emails actually sent.
						</p>
					</div>

					<div className="space-y-3 rounded-2xl border border-stroke-soft-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
						<label className="block font-medium text-[14px] text-text-strong-950 dark:text-white">
							Select your contact list size
						</label>
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
							{CONTACT_TIERS.map((tier, idx) => (
								<button
									key={tier.contacts}
									type="button"
									onClick={() => setSelectedTierIndex(idx)}
									className={cn(
										"rounded-xl py-2 font-medium font-mono text-[13px] transition-all duration-200",
										selectedTierIndex === idx
											? "bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black"
											: "border border-stroke-soft-200/80 bg-bg-weak-50/50 text-text-sub-600 hover:border-stroke-soft-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:text-white",
									)}
								>
									{formatNum(tier.contacts)}
								</button>
							))}
						</div>
					</div>

					{annualSavings > 0 ? (
						<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-white-0 p-5 dark:border-white/10 dark:bg-white/[0.03]">
							<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
								Annual Savings with Reloop
							</p>
							<div className="mt-1 flex items-baseline gap-2">
								<span className="font-bold font-mono text-[2.2rem] text-primary-base leading-none tracking-tight sm:text-[2.6rem]">
									${formatNum(annualSavings)}
								</span>
								<span className="text-[13px] text-text-sub-600 dark:text-white/60">
									/ year saved on Reloop Cloud
								</span>
							</div>
						</div>
					) : null}
				</div>

				{/* Right Side Visual Comparison Cards */}
				<div className="flex-1 space-y-4">
					<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-white-0 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<span className="flex size-7 items-center justify-center rounded-lg bg-text-strong-950 text-white dark:bg-white dark:text-black">
									<Logo className="size-4" />
								</span>
								<div>
									<span className="font-bold text-[16px] text-text-strong-950 dark:text-white">
										Reloop Cloud
									</span>
									<span className="block text-[11px] text-text-sub-600 dark:text-white/40">
										Pay per email sent (~{formatNum(current.emailsSentEstimate)}{" "}
										sends)
									</span>
								</div>
							</div>
							<div className="text-right">
								<span className="font-bold font-mono text-[2rem] text-text-strong-950 dark:text-white">
									${current.reloop}
								</span>
								<span className="text-[12px] text-text-sub-600 dark:text-white/40">
									/mo
								</span>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/80 p-5 dark:border-white/10 dark:bg-white/[0.02]">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								{loopsIcon ? (
									<span className="flex size-7 items-center justify-center rounded-lg border border-stroke-soft-200/80 bg-white dark:border-white/10 dark:bg-white/10">
										<BrandIcon icon={loopsIcon} className="size-4" />
									</span>
								) : null}
								<div>
									<span className="font-bold text-[16px] text-text-strong-950 dark:text-white">
										Loops
									</span>
									<span className="block text-[11px] text-text-sub-600 dark:text-white/40">
										Contact tier penalty ({formatNum(current.contacts)}{" "}
										contacts)
									</span>
								</div>
							</div>
							<div className="text-right">
								<span className="font-bold font-mono text-[2rem] text-text-sub-600 line-through dark:text-white/40">
									${current.loops}
								</span>
								<span className="text-[12px] text-text-sub-600 dark:text-white/40">
									/mo
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
