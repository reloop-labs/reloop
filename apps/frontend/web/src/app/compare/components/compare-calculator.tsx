"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { useState } from "react";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";

const TRANSACTIONAL_PRESETS = [
	{ label: "10k", value: 10000 },
	{ label: "50k", value: 50000 },
	{ label: "100k", value: 100000 },
	{ label: "500k", value: 500000 },
	{ label: "1M", value: 1000000 },
	{ label: "5M", value: 5000000 },
];

const MARKETING_PRESETS = [
	{ label: "5k", value: 5000 },
	{ label: "10k", value: 10000 },
	{ label: "25k", value: 25000 },
	{ label: "50k", value: 50000 },
	{ label: "75k", value: 75000 },
	{ label: "100k", value: 100000 },
];

interface CostsResult {
	reloopCloud: number;
	reloopSelfHosted: number;
	resend: number;
	sendgrid: number;
	postmark: number;
	awsSes: number;
}

function calculateTransactionalCost(emails: number): CostsResult {
	// Reloop Cloud ($0 up to 10k, $0.10 per 1,000 emails after)
	const reloopCloud =
		emails <= 10000 ? 0 : Math.round(((emails - 10000) / 1000) * 0.1);
	const reloopSelfHosted = 0;

	// Resend Transactional Tiers
	let resend = 0;
	if (emails <= 3000) resend = 0;
	else if (emails <= 50000) resend = 20;
	else if (emails <= 100000) resend = 90;
	else if (emails <= 500000) resend = 400;
	else if (emails <= 1000000) resend = 700;
	else resend = 700 + Math.round(((emails - 1000000) / 1000) * 0.9);

	// SendGrid Email API Tiers
	let sendgrid = 0;
	if (emails <= 3000) sendgrid = 0;
	else if (emails <= 50000) sendgrid = 20;
	else if (emails <= 100000) sendgrid = 90;
	else if (emails <= 500000) sendgrid = 450;
	else if (emails <= 1000000) sendgrid = 750;
	else sendgrid = 750 + Math.round(((emails - 1000000) / 1000) * 0.75);

	// Postmark Standard Stream Tiers
	let postmark = 0;
	if (emails <= 10000) postmark = 15;
	else if (emails <= 50000) postmark = 55;
	else if (emails <= 100000) postmark = 115;
	else if (emails <= 500000) postmark = 475;
	else if (emails <= 1000000) postmark = 775;
	else postmark = 775 + Math.round(((emails - 1000000) / 1000) * 0.85);

	// AWS SES ($0.12 per 1,000 + transfer)
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

function calculateMarketingCost(contacts: number): CostsResult {
	// Average sending cadence: ~2 broadcasts/mo to the audience contact list
	const monthlySends = contacts * 2;

	// Reloop charges $0 contact storage fee. Pure pay-per-send ($0.10/1k sends)
	const reloopCloud =
		monthlySends <= 10000
			? 0
			: Math.round(((monthlySends - 10000) / 1000) * 0.1);
	const reloopSelfHosted = 0;

	// Resend Audiences & Contacts Tiered Pricing
	let resend = 0;
	if (contacts <= 1000) resend = 0;
	else if (contacts <= 5000) resend = 20;
	else if (contacts <= 10000) resend = 50;
	else if (contacts <= 50000) resend = 120;
	else if (contacts <= 100000) resend = 350;
	else if (contacts <= 500000) resend = 900;
	else resend = 900 + Math.round(((contacts - 500000) / 1000) * 1.2);

	// SendGrid Marketing Campaigns Contact Tiers
	let sendgrid = 0;
	if (contacts <= 2000) sendgrid = 0;
	else if (contacts <= 10000) sendgrid = 15;
	else if (contacts <= 50000) sendgrid = 60;
	else if (contacts <= 100000) sendgrid = 150;
	else if (contacts <= 500000) sendgrid = 650;
	else sendgrid = 650 + Math.round(((contacts - 500000) / 1000) * 1.0);

	// Postmark / Competitor Marketing Contacts Tiers
	let postmark = 0;
	if (contacts <= 5000) postmark = 25;
	else if (contacts <= 10000) postmark = 55;
	else if (contacts <= 50000) postmark = 150;
	else if (contacts <= 100000) postmark = 350;
	else if (contacts <= 500000) postmark = 800;
	else postmark = 800 + Math.round(((contacts - 500000) / 1000) * 1.0);

	// AWS SES sends + list dedicated IP for marketing
	const awsSes =
		Math.round((monthlySends / 1000) * 0.12) + (contacts > 25000 ? 25 : 0);

	return {
		reloopCloud,
		reloopSelfHosted,
		resend,
		sendgrid,
		postmark,
		awsSes,
	};
}

interface CalculatorColumnProps {
	title: string;
	subtitle: string;
	valueLabel: string;
	unitLabel: string;
	volume: number;
	setVolume: (v: number) => void;
	sliderId: string;
	min: number;
	max: number;
	step: number;
	presets: { label: string; value: number }[];
	costs: CostsResult;
	savingsFootnote?: string;
}

function CalculatorColumn({
	title,
	subtitle,
	valueLabel,
	unitLabel,
	volume,
	setVolume,
	sliderId,
	min,
	max,
	step,
	presets,
	costs,
	savingsFootnote,
}: CalculatorColumnProps) {
	const formatNumber = (num: number) =>
		new Intl.NumberFormat("en-US").format(num);

	const highestCompetitorCost = Math.max(
		costs.resend,
		costs.sendgrid,
		costs.postmark,
		10,
	);
	const annualSavingsVsResend = (costs.resend - costs.reloopCloud) * 12;

	const providers = [
		{
			name: "Reloop Cloud",
			isReloop: true,
			cost: costs.reloopCloud,
			icon: null,
			href: "/pricing",
		},
		{
			name: "Resend",
			isReloop: false,
			cost: costs.resend,
			icon: competitorBrands.find((b) => b.name === "Resend")?.icon,
			href: "/compare/resend",
		},
		{
			name: "SendGrid",
			isReloop: false,
			cost: costs.sendgrid,
			icon: competitorBrands.find((b) => b.name === "SendGrid")?.icon,
			href: "/compare/sendgrid",
		},
		{
			name: "Postmark",
			isReloop: false,
			cost: costs.postmark,
			icon: competitorBrands.find((b) => b.name === "Postmark")?.icon,
			href: "/compare/postmark",
		},
		{
			name: "AWS SES",
			isReloop: false,
			cost: costs.awsSes,
			icon: competitorBrands.find((b) => b.name === "AWS SES")?.icon,
			href: "/compare/aws-ses",
		},
	];

	return (
		<div className="space-y-6">
			{/* Column Header: Title & Subtitle */}
			<div>
				<h3 className="font-semibold text-[18px] text-text-strong-950 tracking-tight sm:text-[19px] dark:text-white">
					{title}
				</h3>
				<p className="mt-1 text-[14px] text-text-sub-600 dark:text-white/60">
					{subtitle}
				</p>
			</div>

			{/* Slider Section */}
			<div className="space-y-4 rounded-xl border border-stroke-soft-200/80 bg-bg-weak-50/30 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02]">
				<div className="flex items-center justify-between">
					<label
						htmlFor={sliderId}
						className="font-medium text-[14px] text-text-strong-950 dark:text-white"
					>
						{valueLabel}
					</label>
					<div className="flex items-baseline gap-1">
						<span className="font-bold font-mono text-[1.4rem] text-text-strong-950 tracking-tight sm:text-[1.5rem] dark:text-white">
							{formatNumber(volume)}
						</span>
						<span className="text-[13px] text-text-sub-600 dark:text-white/50">
							{unitLabel}
						</span>
					</div>
				</div>

				{/* Slider */}
				<input
					id={sliderId}
					type="range"
					min={min}
					max={max}
					step={step}
					value={volume}
					onChange={(e) => setVolume(Number(e.target.value))}
					className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-bg-weak-50 accent-text-strong-950 dark:bg-white/10 dark:accent-white"
				/>

				{/* Preset Buttons */}
				<div className="flex flex-wrap items-center gap-1.5 pt-1">
					{presets.map((preset) => (
						<button
							key={preset.label}
							type="button"
							onClick={() => setVolume(preset.value)}
							className={cn(
								"rounded-lg px-2.5 py-1 font-medium font-mono text-[12px] transition-all duration-200 sm:px-3 sm:py-1.5 sm:text-[13px]",
								volume === preset.value
									? "bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black"
									: "border border-stroke-soft-200/80 bg-white/70 text-text-sub-600 hover:border-stroke-soft-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:text-white",
							)}
						>
							{preset.label}
						</button>
					))}
				</div>
			</div>

			{/* Comparison Bar Chart */}
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
											<BrandIcon icon={provider.icon} className="size-3.5" />
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

			{/* Estimated Annual Savings */}
			{annualSavingsVsResend > 0 ? (
				<div className="border-stroke-soft-200 border-t pt-6 dark:border-white/10">
					<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
						Estimated Annual Savings vs Resend
					</p>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="font-bold font-mono text-[2.2rem] text-primary-base leading-none tracking-tight sm:text-[2.6rem]">
							${formatNumber(annualSavingsVsResend)}
						</span>
						<span className="text-[14px] text-text-sub-600 dark:text-white/60">
							/ year saved on Reloop Cloud
						</span>
					</div>
					<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
						{savingsFootnote ??
							"Or self-host Reloop on your own infrastructure for $0 software licensing cost."}
					</p>
				</div>
			) : null}
		</div>
	);
}

export function CompareCalculator() {
	const [transactionalVolume, setTransactionalVolume] =
		useState<number>(100000);
	const [marketingContacts, setMarketingContacts] = useState<number>(50000);

	const transactionalCosts = calculateTransactionalCost(transactionalVolume);
	const marketingCosts = calculateMarketingCost(marketingContacts);

	return (
		<div className="w-full">
			{/* Left-Aligned Header matching ComparisonGrid style with bottom border */}
			<div className="-mx-6 -mt-12 sm:-mx-10 sm:-mt-16 lg:-mx-12 border-stroke-soft-200 border-b px-6 pt-12 pb-8 sm:px-10 sm:pt-16 sm:pb-10 lg:px-12 dark:border-white/10">
				<div className="flex flex-col items-start gap-2.5">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="size-5 text-text-strong-950 dark:text-white"
						aria-hidden="true"
					>
						<path
							opacity="0.12"
							d="M2 2V15.6C2 17.8402 2 18.9603 2.43597 19.816C2.81947 20.5686 3.43139 21.1805 4.18404 21.564C5.03969 22 6.15979 22 8.4 22H18V12V2L15.2874 3.20562L15.2873 3.20562C14.6759 3.47739 14.3701 3.61328 14.0607 3.64727C13.7214 3.68455 13.3782 3.63437 13.0638 3.50149C12.777 3.38032 12.523 3.16258 12.0149 2.7271C11.3403 2.14881 11.0029 1.85966 10.6296 1.73584C10.2208 1.60026 9.77918 1.60026 9.3704 1.73584C8.99706 1.85966 8.65972 2.14881 7.98505 2.7271L7.98505 2.7271C7.47699 3.16258 7.22295 3.38032 6.93623 3.50149C6.6218 3.63437 6.2786 3.68455 5.93929 3.64727C5.62988 3.61328 5.32414 3.47739 4.71265 3.20562L2 2Z"
							fill="currentColor"
						/>
						<path
							d="M18 12V2L15.2874 3.20562C14.6759 3.47739 14.3701 3.61328 14.0607 3.64727C13.7214 3.68455 13.3782 3.63437 13.0638 3.50149C12.777 3.38032 12.523 3.16258 12.0149 2.7271C11.3403 2.14881 11.0029 1.85966 10.6296 1.73584C10.2208 1.60026 9.77918 1.60026 9.3704 1.73584C8.99706 1.85966 8.65972 2.14881 7.98505 2.7271L7.98505 2.7271C7.47699 3.16258 7.22295 3.38032 6.93623 3.50149C6.6218 3.63437 6.2786 3.68455 5.93929 3.64727C5.62988 3.61328 5.32414 3.47739 4.71265 3.20562L2 2V15.6C2 17.8402 2 18.9603 2.43597 19.816C2.81947 20.5686 3.43139 21.1805 4.18404 21.564C5.03968 22 6.15979 22 8.4 22H20M18 12H18.8C19.9201 12 20.4802 12 20.908 12.218C21.2843 12.4097 21.5903 12.7157 21.782 13.092C22 13.5198 22 14.0799 22 15.2V20C22 21.1046 21.1046 22 20 22M18 12V20C18 21.1046 18.8954 22 20 22M12 10H10M10 10H9.5C8.67157 10 8 10.6716 8 11.5C8 12.3284 8.67157 13 9.5 13H10.5C11.3284 13 12 13.6716 12 14.5C12 15.3284 11.3284 16 10.5 16H10M10 10V9M10 16H8M10 16V17"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Estimate your monthly email bill.
					</h2>
				</div>
			</div>

			{/* Side-by-Side Transactional and Marketing Comparison */}
			<div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-0">
				{/* Left Column: Transactional Email (Monthly Volume) */}
				<div className="flex flex-1 flex-col justify-between pt-8 pb-10 lg:border-stroke-soft-200 lg:border-r lg:pr-8 xl:pr-12 dark:lg:border-white/10">
					<CalculatorColumn
						title="Transactional email."
						subtitle="API and system-triggered messaging."
						valueLabel="Monthly email volume"
						unitLabel="/ mo"
						volume={transactionalVolume}
						setVolume={setTransactionalVolume}
						sliderId="transactional-email-slider"
						min={10000}
						max={5000000}
						step={10000}
						presets={TRANSACTIONAL_PRESETS}
						costs={transactionalCosts}
						savingsFootnote="Or self-host Reloop on your own infrastructure for $0 software licensing cost."
					/>
				</div>

				{/* Right Column: Marketing Email (Audience Contacts) */}
				<div className="flex flex-1 flex-col justify-between pt-8 pb-10 lg:pl-8 xl:pl-12">
					<CalculatorColumn
						title="Marketing email."
						subtitle="Broadcasts, audiences, and campaigns."
						valueLabel="Audience contacts"
						unitLabel="contacts"
						volume={marketingContacts}
						setVolume={setMarketingContacts}
						sliderId="marketing-contacts-slider"
						min={1000}
						max={100000}
						step={1000}
						presets={MARKETING_PRESETS}
						costs={marketingCosts}
						savingsFootnote="Reloop charges $0 for contact storage. You only pay for what you actually send ($0.10 / 1k emails)."
					/>
				</div>
			</div>
		</div>
	);
}
