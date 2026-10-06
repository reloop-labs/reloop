"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import {
	comparisonSections,
	type PlanId,
	pricingPlans,
} from "@reloop/web/lib/pricing";
import Link from "next/link";
import { Fragment } from "react";
import { formatCreditsCost } from "./pricing-credits-slider";
import { getFeatureIcon } from "./pricing-section";

type CreditColumn = {
	name: string;
	badge?: string;
	price: string;
	priceSubline?: string;
	middlePrimary: string | ((volume: number) => string);
	middleStrong?: boolean;
	middleSecondary?: string;
	highlight?: boolean;
	features: string[];
	ctaLabel: string;
	ctaHref: string;
	ctaExternal?: boolean;
	primary?: boolean;
	priceForVolume?: (volume: number) => {
		price: string;
		priceSubline?: string;
	};
};

const creditColumns: CreditColumn[] = [
	{
		name: "Free",
		price: "$0",
		middlePrimary: "Free for everyone",
		features: [
			"3,000 emails / month",
			"100 emails / day",
			"1 agent inbox",
			"1 webhook",
			"3 custom domains",
			"1 MB attachments",
			"Data retention (45 days)",
			"Community support",
		],
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
	},
	{
		name: "Credit",
		price: "$5",
		priceSubline: "/ 10,000 emails one-time",
		priceForVolume: (volume: number) => ({
			price: formatCreditsCost(volume),
			priceSubline: "/ one-time",
		}),
		middlePrimary: (volume: number) =>
			`${new Intl.NumberFormat("en-US").format(volume)} emails / 6 months`,
		middleStrong: true,
		middleSecondary: "Extra emails: $0.50 / 1,000",
		highlight: true,
		features: [
			"50,000 emails / month",
			"No daily limit",
			"5 agent inboxes",
			"5 webhooks",
			"5 custom domains",
			"5 MB attachments",
			"Data retention (45 days)",
			"Dedicated support",
		],
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
	},
	{
		name: "Business",
		badge: "High volume",
		price: "Custom",
		middlePrimary: "Custom volume & billing",
		middleSecondary: "Volume discounts available.",
		features: [
			"Custom email volume",
			"No daily limit",
			"Custom agent inboxes",
			"Custom webhooks",
			"Custom domains",
			"Custom attachments",
			"Data retention (45 days)",
			"Dedicated support & SLA",
		],
		ctaLabel: "Book a call",
		ctaHref: "https://cal.com/pranavp/30",
		ctaExternal: true,
		primary: true,
	},
];

const columnBorders = [
	"border-b sm:border-r sm:border-b-0",
	"border-b sm:border-r sm:border-b-0",
	"",
];

function CreditColumnCard({
	column,
	index,
	volume,
}: {
	column: CreditColumn;
	index: number;
	volume: number;
}) {
	const displayPrice = column.priceForVolume?.(volume) ?? {
		price: column.price,
		priceSubline: column.priceSubline,
	};
	return (
		<div
			className={cn(
				"flex min-h-[440px] flex-col border-stroke-soft-100 p-6 pb-5 sm:min-h-[460px] sm:p-8 sm:pb-6 dark:border-white/[0.07]",
				column.highlight && "bg-bg-weak-50 dark:bg-white/[0.03]",
				columnBorders[index],
			)}
		>
			<div>
				<div className="flex h-6 items-center justify-between gap-2">
					<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
						{column.name}
					</h3>
					{column.badge && (
						<span className="relative shrink-0 overflow-hidden rounded-full bg-primary-base px-2 py-0.5 text-center font-semibold text-[10px] text-white uppercase tracking-[0.14em] shadow-fancy-buttons-primary before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-static-white before:to-transparent before:opacity-[.16] dark:text-black">
							{column.badge}
						</span>
					)}
				</div>

				<div className="mt-6 h-8">
					<div className="flex items-end gap-1">
						<span className="font-semibold text-[2rem] text-text-strong-950 tabular-nums leading-none tracking-tight dark:text-white">
							{displayPrice.price}
						</span>
						{displayPrice.priceSubline && (
							<span className="mb-1 text-[15px] text-text-sub-600 dark:text-white/50">
								{displayPrice.priceSubline}
							</span>
						)}
					</div>
				</div>
			</div>

			<div
				aria-hidden
				className="-mx-6 sm:-mx-8 mt-6 border-stroke-soft-100 border-t dark:border-white/[0.07]"
			/>

			<div className="flex h-[100px] flex-col justify-center py-4">
				<p
					className={cn(
						"text-[14px]",
						column.middleStrong
							? "font-medium text-text-strong-950 dark:text-white"
							: "text-text-sub-600 dark:text-white/55",
					)}
				>
					{typeof column.middlePrimary === "function"
						? column.middlePrimary(volume)
						: column.middlePrimary}
				</p>
				{column.middleSecondary && (
					<p className="mt-0.5 text-[12px] text-text-sub-600 dark:text-white/50">
						{column.middleSecondary}
					</p>
				)}
			</div>

			<div
				aria-hidden
				className="-mx-6 sm:-mx-8 border-stroke-soft-100 border-t dark:border-white/[0.07]"
			/>

			<div className="flex flex-col gap-3 py-6">
				<FancyButton.Root
					asChild
					variant={column.primary ? "primary" : "basic"}
					size="medium"
					className={cn(
						"h-11! w-full! rounded-full! px-6!",
						column.primary && "dark:text-black",
					)}
				>
					{column.ctaExternal ? (
						<a href={column.ctaHref} target="_blank" rel="noopener noreferrer">
							<span className="font-medium text-[14px]">{column.ctaLabel}</span>
						</a>
					) : (
						<Link href={column.ctaHref}>
							<span className="font-medium text-[14px]">{column.ctaLabel}</span>
						</Link>
					)}
				</FancyButton.Root>
			</div>

			<div
				aria-hidden
				className="-mx-6 sm:-mx-8 border-stroke-soft-100 border-t dark:border-white/[0.07]"
			/>

			<ul className="flex-1 space-y-1.5 pt-6">
				{column.features.map((feature) => (
					<li
						key={feature}
						className="flex min-h-[24px] items-center gap-3 text-[14px] leading-snug"
					>
						{getFeatureIcon(feature)}
						<span className="text-text-sub-600 dark:text-white/60">
							{feature}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function DedicatedIpStrip() {
	return (
		<div className="-mx-4 sm:-mx-6 lg:-mx-8 border-stroke-soft-100 border-b dark:border-white/[0.07]">
			<div className="flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
				<div>
					<p className="font-medium text-[12px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/55">
						Add-on
					</p>
					<p className="mt-2 text-[15px] text-text-strong-950 dark:text-white">
						<span className="font-semibold">Dedicated IP — $10/mo</span>{" "}
						<span className="text-text-sub-600 dark:text-white/55">
							billed annually ($120/yr). Your own sending IP with full
							reputation control, available on any plan.
						</span>
					</p>
				</div>
				<FancyButton.Root
					asChild
					variant="basic"
					size="medium"
					className="h-10! shrink-0 rounded-full! px-5!"
				>
					<Link href="/contact">
						<span className="font-medium text-[14px]">Contact sales</span>
					</Link>
				</FancyButton.Root>
			</div>
		</div>
	);
}

function ChooseGuide() {
	return (
		<div className="-mx-4 sm:-mx-6 lg:-mx-8 border-stroke-soft-100 border-b dark:border-white/[0.07]">
			<div className="mx-auto w-full max-w-2xl px-6 py-14 text-center sm:py-16">
				<p className="font-medium text-[12px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/55">
					How to choose
				</p>
				<p className="mt-5 text-balance font-medium text-[1.65rem] text-text-strong-950 leading-[1.25] tracking-tight sm:text-[2rem] dark:text-white">
					“Credits for flexibility, Monthly for scale.”
				</p>
				<div className="mx-auto mt-8 max-w-xl space-y-3">
					<p className="text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
						<span className="font-semibold text-text-strong-950 dark:text-white">
							Choose Credits
						</span>{" "}
						when volume is irregular or seasonal no subscription, top up any
						amount as you go.
					</p>
					<p className="text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
						<span className="font-semibold text-text-strong-950 dark:text-white">
							Choose Monthly
						</span>{" "}
						when volume is steady and predictable bundled at a lower rate for
						50,000+ emails a month.
					</p>
				</div>
			</div>
		</div>
	);
}

const CREDIT_COMPARE_GRID_COLS =
	"grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(140px,1fr))]";

function CreditCompareCheck() {
	return (
		<svg
			fill="none"
			height="24"
			viewBox="0 0 20 20"
			width="24"
			xmlns="http://www.w3.org/2000/svg"
			className="text-text-strong-950 dark:text-white"
			aria-label="Included"
			role="img"
		>
			<circle cx="10" cy="10" fill="currentColor" fillOpacity="0.1" r="8" />
			<path
				d="M7 10.5L9 12.5L13 7.5"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.25"
			/>
		</svg>
	);
}

function CreditCompareCross() {
	return (
		<svg
			fill="none"
			height="20"
			viewBox="0 0 20 20"
			width="20"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Not included"
			role="img"
		>
			<path
				d="M7 7L13 13M13 7L7 13"
				stroke="#060606"
				strokeOpacity="0.37"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="dark:stroke-opacity-30 dark:stroke-white"
			/>
		</svg>
	);
}

function CreditCompareCell({
	value,
	type,
}: {
	value: string | boolean;
	type: "text" | "boolean";
}) {
	const unavailable = type === "boolean" ? !value : value === "-";

	if (unavailable) {
		return <CreditCompareCross />;
	}

	if (type === "boolean") {
		return <CreditCompareCheck />;
	}

	return (
		<span className="text-center text-[14px] text-text-strong-950 dark:text-white/85">
			{value as string}
		</span>
	);
}

const creditComparePlans = [
	{
		id: "free",
		name: "Free",
		cta: "Get started",
		href: "/dashboard/signup",
		external: false,
		primary: false,
	},
	{
		id: "starter",
		name: "Credit",
		cta: "Get started",
		href: "/dashboard/signup",
		external: false,
		primary: true,
	},
	{
		id: "business",
		name: "Business",
		cta: "Book a call",
		href: "https://cal.com/pranavp/30",
		external: true,
		primary: false,
	},
] as const;

type CreditPlanIndex = 0 | 1 | 2;

function getCreditComparison(planId: PlanId) {
	const plan = pricingPlans.find((p) => p.id === planId);
	if (!plan) throw new Error(`Unknown plan: ${planId}`);
	return plan.comparison;
}

const creditComparisons = [
	getCreditComparison("free"),
	getCreditComparison("individual"),
	getCreditComparison("enterprise"),
] as const;

type ComparisonRowKey = keyof (typeof creditComparisons)[number];

const CREDIT_VALIDITY_KEY = "creditValidity";

function creditCompareValue(
	planIndex: CreditPlanIndex,
	key: ComparisonRowKey | typeof CREDIT_VALIDITY_KEY,
): string | boolean {
	if (key === "monthlyEmails") {
		return (["3,000", "Pay as you go", "Custom"] as const)[planIndex];
	}
	if (key === CREDIT_VALIDITY_KEY) {
		return (["—", "6 months", "Custom"] as const)[planIndex];
	}
	if (key === "dedicatedIp") {
		return "Add-on";
	}
	return creditComparisons[planIndex][key];
}

const creditSectionIcons: Record<string, string> = {
	Volume: "mail-single",
	Resources: "database",
	"Email API": "api",
	"Inbox & AI": "magic-wand",
	Deliverability: "shield",
	Analytics: "graph-up",
	Platform: "grid",
	"Support & Services": "headset",
	"Security & Compliance": "lock",
};

function creditSectionIcon(title: string) {
	return creditSectionIcons[title] ?? "magic-wand";
}

export function CreditsComparisonTable() {
	return (
		<div className="-mx-4 sm:-mx-6 lg:-mx-8 border-stroke-soft-100 border-b dark:border-white/[0.07]">
			<div className="overflow-x-auto">
				<div
					className={cn(
						"grid w-full min-w-[820px] border-stroke-soft-100 border-t dark:border-white/10",
						CREDIT_COMPARE_GRID_COLS,
					)}
				>
					<div className="flex flex-col gap-3 border-stroke-soft-100 border-b px-5 py-7 sm:px-7 lg:px-9 dark:border-white/10">
						<p className="font-medium text-[12px] text-text-strong-950 uppercase tracking-[0.12em] dark:text-white/55">
							Credits
						</p>
						<h3 className="font-medium text-text-strong-950 leading-none dark:text-white">
							Compare credit plans
						</h3>
					</div>
					{creditComparePlans.map((plan) => (
						<div
							key={plan.id}
							className="flex flex-col justify-center gap-4 border-stroke-soft-100 border-b border-l px-5 py-7 sm:px-6 dark:border-white/10"
						>
							<span className="font-medium text-[15px] text-text-strong-950 leading-none dark:text-white">
								{plan.name}
							</span>
							<FancyButton.Root
								asChild
								variant={plan.primary ? "primary" : "basic"}
								size="medium"
								className={cn(
									"h-10! w-full! rounded-full! px-5!",
									plan.primary && "dark:text-black",
								)}
							>
								{plan.external ? (
									<a href={plan.href} target="_blank" rel="noopener noreferrer">
										<span className="truncate font-medium text-[14px] tracking-[-0.01em]">
											{plan.cta}
										</span>
									</a>
								) : (
									<Link href={plan.href}>
										<span className="truncate font-medium text-[14px] tracking-[-0.01em]">
											{plan.cta}
										</span>
									</Link>
								)}
							</FancyButton.Root>
						</div>
					))}

					<div className="h-14 border-stroke-soft-100 border-b dark:border-white/10" />
					{creditComparePlans.map((plan) => (
						<div
							key={`spacer-${plan.id}`}
							className="h-14 border-stroke-soft-100 border-b border-l dark:border-white/10"
						/>
					))}

					{comparisonSections.map((section, sectionIndex) => (
						<Fragment key={section.title}>
							{sectionIndex > 0 && (
								<>
									<div className="h-14 border-stroke-soft-100 border-b dark:border-white/10" />
									{creditComparePlans.map((plan) => (
										<div
											key={`spacer-${section.title}-${plan.id}`}
											className="h-14 border-stroke-soft-100 border-b border-l dark:border-white/10"
										/>
									))}
								</>
							)}
							<div className="flex items-center gap-2.5 border-stroke-soft-100 border-b px-5 pt-6 pb-3 sm:px-7 lg:px-9 dark:border-white/[0.07]">
								<Icon
									name={creditSectionIcon(section.title)}
									className="size-4 shrink-0 text-text-strong-950 dark:text-white/80"
								/>
								<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
									{section.title}
								</span>
							</div>
							{creditComparePlans.map((plan) => (
								<div
									key={`${section.title}-${plan.id}-title`}
									className="border-stroke-soft-100 border-b border-l pt-6 pb-3 dark:border-white/[0.07]"
								/>
							))}
							{(section.title === "Volume"
								? [
										...section.rows,
										{
											label: "Credit validity",
											key: CREDIT_VALIDITY_KEY,
											type: "text" as const,
										},
									]
								: section.rows
							).map((row) => (
								<div
									key={row.key}
									className="group/row col-span-full grid grid-cols-subgrid"
								>
									<div
										className={cn(
											"flex min-h-[60px] items-center border-stroke-soft-100 border-b px-5 py-4 sm:px-7 lg:px-9 dark:border-white/[0.07]",
											"group-hover/row:bg-bg-weak-50/70 dark:group-hover/row:bg-white/[0.03]",
										)}
									>
										<span className="text-[14px] text-text-strong-950 dark:text-white">
											{row.label}
										</span>
									</div>
									{([0, 1, 2] as const).map((planIndex) => (
										<div
											key={creditComparePlans[planIndex]?.id ?? planIndex}
											className={cn(
												"flex min-h-[60px] items-center justify-center border-stroke-soft-100 border-b border-l px-4 py-4 text-center dark:border-white/[0.07]",
												"group-hover/row:bg-bg-weak-50/70 dark:group-hover/row:bg-white/[0.03]",
											)}
										>
											<CreditCompareCell
												value={creditCompareValue(
													planIndex,
													row.key as
														| ComparisonRowKey
														| typeof CREDIT_VALIDITY_KEY,
												)}
												type={row.type}
											/>
										</div>
									))}
								</div>
							))}
						</Fragment>
					))}
				</div>
			</div>

			<div className="px-6 py-8 text-center sm:px-8">
				<p className="text-[13px] text-text-sub-600 dark:text-white/45">
					Move the slider above to see Credit pricing at your own volume.
				</p>
			</div>
		</div>
	);
}

export function PricingCreditsSection({ volume }: { volume: number }) {
	return (
		<>
			<div className="-mx-4 sm:-mx-6 lg:-mx-8 border-stroke-soft-100 border-y sm:grid sm:grid-cols-3 dark:border-white/[0.07]">
				{creditColumns.map((column, index) => (
					<CreditColumnCard
						key={column.name}
						column={column}
						index={index}
						volume={volume}
					/>
				))}
			</div>
			<DedicatedIpStrip />
			<ChooseGuide />
			<CreditsComparisonTable />
		</>
	);
}
