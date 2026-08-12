"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { useState } from "react";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";

const VOLUME_PRESETS = [
	{ label: "10k", value: 10000 },
	{ label: "50k", value: 50000 },
	{ label: "100k", value: 100000 },
	{ label: "500k", value: 500000 },
	{ label: "1M", value: 1000000 },
	{ label: "5M", value: 5000000 },
];

function calculateMonthlyCost(emails: number) {
	// Reloop Cloud ($0 up to 10k, $0.10 per 1,000 emails after)
	const reloopCloud =
		emails <= 10000 ? 0 : Math.round(((emails - 10000) / 1000) * 0.1);

	// Reloop Self-Hosted ($0 software cost)
	const reloopSelfHosted = 0;

	// Resend pricing tier approximation
	let resend = 0;
	if (emails <= 3000) resend = 0;
	else if (emails <= 50000) resend = 20;
	else if (emails <= 100000) resend = 90;
	else if (emails <= 500000) resend = 400;
	else if (emails <= 1000000) resend = 700;
	else resend = 700 + Math.round(((emails - 1000000) / 1000) * 0.9);

	// SendGrid pricing tier approximation
	let sendgrid = 0;
	if (emails <= 3000) sendgrid = 0;
	else if (emails <= 50000) sendgrid = 20;
	else if (emails <= 100000) sendgrid = 90;
	else if (emails <= 500000) sendgrid = 450;
	else if (emails <= 1000000) sendgrid = 750;
	else sendgrid = 750 + Math.round(((emails - 1000000) / 1000) * 0.75);

	// Postmark pricing tier approximation
	let postmark = 0;
	if (emails <= 10000) postmark = 15;
	else if (emails <= 50000) postmark = 55;
	else if (emails <= 100000) postmark = 115;
	else if (emails <= 500000) postmark = 475;
	else if (emails <= 1000000) postmark = 775;
	else postmark = 775 + Math.round(((emails - 1000000) / 1000) * 0.85);

	// AWS SES ($0.10 per 1,000 + data transfer)
	const awsSes = Math.round((emails / 1000) * 0.12);

	return {
		reloopCloud,
		reloopSelfHosted,
		resend,
		sendgrid,
		postmark,
		awsSes,
	};
}

export function CompareCalculator() {
	const [volume, setVolume] = useState<number>(100000);

	const costs = calculateMonthlyCost(volume);
	const highestCompetitorCost = Math.max(
		costs.resend,
		costs.sendgrid,
		costs.postmark,
		10,
	);
	const annualSavingsVsResend = (costs.resend - costs.reloopCloud) * 12;

	const formatNumber = (num: number) =>
		new Intl.NumberFormat("en-US").format(num);

	const providers = [
		{
			name: "Reloop Cloud",
			isReloop: true,
			cost: costs.reloopCloud,
			icon: null,
			href: "/pricing",
			note: "$0.10 / 1k emails",
		},
		{
			name: "Resend",
			isReloop: false,
			cost: costs.resend,
			icon: competitorBrands.find((b) => b.name === "Resend")?.icon,
			href: "/compare/resend",
			note: "Tiered + Overages",
		},
		{
			name: "SendGrid",
			isReloop: false,
			cost: costs.sendgrid,
			icon: competitorBrands.find((b) => b.name === "SendGrid")?.icon,
			href: "/compare/sendgrid",
			note: "Pro Tier",
		},
		{
			name: "Postmark",
			isReloop: false,
			cost: costs.postmark,
			icon: competitorBrands.find((b) => b.name === "Postmark")?.icon,
			href: "/compare/postmark",
			note: "Standard Tier",
		},
		{
			name: "AWS SES",
			isReloop: false,
			cost: costs.awsSes,
			icon: competitorBrands.find((b) => b.name === "AWS SES")?.icon,
			href: "/compare/aws-ses",
			note: "$0.10/1k + Data transfer",
		},
	];

	return (
		<div className="w-full rounded-3xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-6 sm:p-10 dark:border-white/10 dark:bg-white/[0.02]">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
				{/* Calculator Controls */}
				<div className="flex-1 space-y-6">
					<div>
						<span className="font-bold text-[12px] text-text-sub-600 uppercase tracking-widest dark:text-white/50">
							ROI & Cost Calculator
						</span>
						<h3 className="mt-2 font-serif text-[1.8rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.2rem] dark:text-white">
							Estimate your monthly email bill
						</h3>
						<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Adjust your monthly sending volume to compare Reloop Cloud with
							traditional email APIs.
						</p>
					</div>

					{/* Volume Input Controls */}
					<div className="space-y-4 rounded-2xl border border-stroke-soft-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
						<div className="flex items-center justify-between">
							<label
								htmlFor="email-volume-slider"
								className="font-medium text-[14px] text-text-strong-950 dark:text-white"
							>
								Monthly email volume
							</label>
							<div className="flex items-baseline gap-1">
								<span className="font-bold font-mono text-[1.5rem] text-text-strong-950 tracking-tight dark:text-white">
									{formatNumber(volume)}
								</span>
								<span className="text-[13px] text-text-sub-600 dark:text-white/50">
									/ mo
								</span>
							</div>
						</div>

						{/* Slider */}
						<input
							id="email-volume-slider"
							type="range"
							min={10000}
							max={5000000}
							step={10000}
							value={volume}
							onChange={(e) => setVolume(Number(e.target.value))}
							className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-bg-weak-50 accent-text-strong-950 dark:bg-white/10 dark:accent-white"
						/>

						{/* Preset Buttons */}
						<div className="flex flex-wrap gap-2 pt-2">
							{VOLUME_PRESETS.map((preset) => (
								<button
									key={preset.label}
									type="button"
									onClick={() => setVolume(preset.value)}
									className={cn(
										"rounded-lg px-3 py-1.5 font-medium font-mono text-[13px] transition-all duration-200",
										volume === preset.value
											? "bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black"
											: "border border-stroke-soft-200/80 bg-bg-weak-50/50 text-text-sub-600 hover:border-stroke-soft-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:text-white",
									)}
								>
									{preset.label}
								</button>
							))}
						</div>
					</div>

					{/* Annual Savings Summary Callout */}
					{annualSavingsVsResend > 0 ? (
						<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-white-0 p-5 dark:border-white/10 dark:bg-white/[0.03]">
							<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
								Estimated Annual Savings vs Resend
							</p>
							<div className="mt-1 flex items-baseline gap-2">
								<span className="font-bold font-mono text-[2rem] text-primary-base leading-none tracking-tight sm:text-[2.4rem]">
									${formatNumber(annualSavingsVsResend)}
								</span>
								<span className="text-[13px] text-text-sub-600 dark:text-white/60">
									/ year saved on Reloop Cloud
								</span>
							</div>
							<p className="mt-2 text-[13px] text-text-sub-600 dark:text-white/50">
								Or self-host Reloop on your own infrastructure for $0 software
								licensing cost.
							</p>
						</div>
					) : null}
				</div>

				{/* Provider Visual Bar Chart */}
				<div className="flex-1 space-y-4 pt-2 lg:pt-0">
					<div className="flex items-center justify-between border-stroke-soft-200 border-b pb-3 dark:border-white/10">
						<span className="font-bold text-[13px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
							Provider
						</span>
						<span className="font-bold text-[13px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
							Estimated Monthly Bill
						</span>
					</div>

					<div className="space-y-3">
						{providers.map((provider) => {
							const percentage = Math.max(
								(provider.cost / highestCompetitorCost) * 100,
								6,
							);

							return (
								<div key={provider.name} className="group space-y-1.5">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2.5">
											{provider.isReloop ? (
												<span className="flex size-6 items-center justify-center rounded-md bg-text-strong-950 dark:bg-white">
													<Logo className="size-3.5 text-white dark:text-black" />
												</span>
											) : provider.icon ? (
												<span className="flex size-6 items-center justify-center rounded-md border border-stroke-soft-200/80 bg-bg-weak-50 dark:border-white/10 dark:bg-white/10">
													<BrandIcon
														icon={provider.icon}
														className="size-3.5"
													/>
												</span>
											) : null}

											<Link
												href={provider.href}
												className={cn(
													"font-medium text-[14px] transition-colors",
													provider.isReloop
														? "font-bold text-text-strong-950 dark:text-white"
														: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/70 dark:hover:text-white",
												)}
											>
												{provider.name}
											</Link>

											{provider.isReloop ? (
												<span className="rounded-full bg-text-strong-950/10 px-2 py-0.5 font-bold font-mono text-[10px] text-text-strong-950 uppercase dark:bg-white/10 dark:text-white">
													Recommended
												</span>
											) : null}
										</div>

										<div className="flex items-baseline gap-2">
											<span className="font-mono font-semibold text-[15px] text-text-strong-950 tabular-nums dark:text-white">
												${formatNumber(provider.cost)}
											</span>
											<span className="text-[11px] text-text-sub-600 dark:text-white/40">
												/mo
											</span>
										</div>
									</div>

									{/* Bar Fill */}
									<div className="h-3 w-full overflow-hidden rounded-full bg-bg-weak-50/80 dark:bg-white/[0.06]">
										<div
											className={cn(
												"h-full rounded-full transition-all duration-500 ease-out",
												provider.isReloop
													? "bg-text-strong-950 dark:bg-white"
													: "bg-slate-300 dark:bg-white/20",
											)}
											style={{ width: `${percentage}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>

					<p className="pt-2 text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
						*Estimates based on published public cloud pricing tiers as of 2026.
						Infrastructure data transfer fees may apply.
					</p>
				</div>
			</div>
		</div>
	);
}
