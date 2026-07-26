"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	comparisonSections,
	formatPrice,
	getPlanPrice,
	pricingPlans,
} from "@reloop/web/lib/pricing";
import Link from "next/link";
import { Fragment } from "react";

function PlanCtaLink({
	href,
	label,
	external,
	variant = "default",
}: {
	href: string;
	label: string;
	external?: boolean;
	variant?: "default" | "primary";
}) {
	const className = cn(
		"group inline-flex h-11 items-center justify-center overflow-hidden rounded-full px-5 font-medium text-[14px] transition-colors duration-300",
		variant === "primary"
			? "bg-text-strong-950 text-white hover:bg-text-strong-950/90 dark:bg-white dark:text-[#0a0d12] dark:hover:bg-white/90"
			: "border border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 hover:bg-bg-weak-50 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]",
	);

	const content = (
		<span className="inline-flex items-center">
			<span className="group-hover:-translate-x-1 transition-transform duration-300 ease-out">
				{label}
			</span>
			<Icon
				name="arrow-up-right"
				className="ml-0 size-4 max-w-0 shrink-0 translate-x-1 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-4 group-hover:translate-x-0 group-hover:opacity-100"
				aria-hidden
			/>
		</span>
	);

	if (external) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={className}
			>
				{content}
			</a>
		);
	}

	return (
		<Link href={href} className={className}>
			{content}
		</Link>
	);
}

function getFeatureIcon(feature: string) {
	const key = feature.toLowerCase().trim();

	if (key.includes("all ") && key.includes("features")) {
		return (
			<Icon
				name="sparkling"
				className="mt-0.5 size-4 shrink-0 text-primary-base"
			/>
		);
	}
	if (
		key.includes("email") &&
		(key.includes("month") || key.includes("volume"))
	) {
		return (
			<Icon
				name="mail-single"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("inbox") || key.includes("agent")) {
		return (
			<Icon
				name="agent"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("webhook")) {
		return (
			<Icon
				name="webhook"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("domain")) {
		return (
			<Icon
				name="globe"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("transactional") || key.includes("campaign")) {
		return (
			<Icon
				name="mega-phone"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("smtp") || key.includes("analytics")) {
		return (
			<Icon
				name="smtp"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("attachment")) {
		return (
			<Icon
				name="paperclip"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("support") || key.includes("sla")) {
		return (
			<Icon
				name="headset"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("overage")) {
		return (
			<Icon
				name="invoice"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("throughput") || key.includes("second")) {
		return (
			<Icon
				name="zap"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("validation")) {
		return (
			<Icon
				name="shield"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("ip")) {
		return (
			<Icon
				name="mail-server"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}
	if (key.includes("security") || key.includes("lock")) {
		return (
			<Icon
				name="lock"
				className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
		);
	}

	return (
		<Icon
			name="sparkling"
			className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
		/>
	);
}

function PlanColumn({
	plan,
	index,
}: {
	plan: (typeof pricingPlans)[number];
	index: number;
}) {
	const price = getPlanPrice(plan);
	const isCustom = price === null;

	const borderClasses = [
		"border-b sm:border-r sm:border-b lg:border-r lg:border-b-0",
		"border-b sm:border-r-0 sm:border-b lg:border-r lg:border-b-0",
		"border-b sm:border-r sm:border-b-0 lg:border-r lg:border-b-0",
		"border-b-0 sm:border-b-0 sm:border-r-0 lg:border-r-0 lg:border-b-0",
	][index];

	return (
		<div
			className={cn(
				"flex min-h-[640px] flex-col border-stroke-soft-200 p-6 sm:min-h-[680px] sm:p-8 lg:p-6 xl:p-8 dark:border-white/10",
				borderClasses,
				plan.highlighted && "bg-bg-weak-50 dark:bg-white/[0.03]",
			)}
		>
			<div>
				<div className="flex items-center gap-2">
					<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
						{plan.name}
					</h3>
					{plan.badge && (
						<span className="shrink-0 rounded-full bg-primary-base px-2 py-0.5 text-center font-semibold text-[10px] text-white uppercase tracking-[0.14em]">
							{plan.badge}
						</span>
					)}
				</div>

				<div className="mt-6">
					{isCustom ? (
						<p className="font-serif text-[2.4rem] text-text-strong-950 leading-none tracking-tighter dark:text-white">
							Custom
						</p>
					) : (
						<div className="flex items-end gap-1">
							<span className="font-serif text-[2.4rem] text-text-strong-950 leading-none tracking-tighter dark:text-white">
								{formatPrice(price)}
							</span>
							{price > 0 && (
								<span className="mb-1 font-sans text-[15px] text-text-sub-600 dark:text-white/50">
									{plan.priceSubline}
								</span>
							)}
						</div>
					)}
					<p className="mt-2 text-[14px] text-text-sub-600 dark:text-white/55">
						{isCustom || price === 0 ? plan.priceSubline : plan.emailsLabel}
					</p>
				</div>
			</div>

			<ul className="mt-10 flex-1 space-y-3">
				{plan.features.map((feature) => (
					<li
						key={feature}
						className="flex items-start gap-3 text-[14px] leading-snug"
					>
						{getFeatureIcon(feature)}
						<span className="text-text-sub-600 dark:text-white/60">
							{feature}
						</span>
					</li>
				))}
			</ul>

			<div
				className={cn(
					"mt-10 flex flex-col gap-3",
					plan.secondaryCta && "sm:flex-row sm:items-center",
				)}
			>
				<PlanCtaLink
					href={plan.ctaHref}
					label={plan.ctaLabel}
					external={plan.ctaExternal}
					variant={plan.highlighted ? "primary" : "default"}
				/>
				{plan.secondaryCta && (
					<PlanCtaLink
						href={plan.secondaryCta.href}
						label={plan.secondaryCta.label}
						external={plan.secondaryCta.external}
					/>
				)}
			</div>
		</div>
	);
}

function ComparisonCell({
	value,
	type,
}: {
	value: string | boolean;
	type: "text" | "boolean";
}) {
	const unavailable = type === "boolean" ? !value : value === "—";

	if (unavailable) {
		return (
			<Icon
				name="cross"
				className="size-4 text-text-sub-600/50 dark:text-white/20"
				aria-label="Not included"
			/>
		);
	}

	if (type === "boolean") {
		return (
			<Icon
				name="check-circle"
				className="size-4 text-text-strong-950 dark:text-white/85"
				aria-label="Included"
			/>
		);
	}

	return (
		<span className="inline-flex items-center gap-2.5 text-[14px]">
			<Icon
				name="check-circle"
				className="size-4 shrink-0 text-text-strong-950 dark:text-white/85"
				aria-hidden
			/>
			<span className="text-text-strong-950 dark:text-white/85">
				{value as string}
			</span>
		</span>
	);
}

const COMPARISON_GRID_COLS =
	"grid-cols-[minmax(160px,34%)_repeat(4,minmax(140px,1fr))]";

function comparisonPriceLine(plan: (typeof pricingPlans)[number]) {
	if (plan.monthlyPrice === null) {
		return { amount: "Custom", caption: "pricing" };
	}
	if (plan.monthlyPrice === 0) {
		return { amount: formatPrice(0), caption: "Free for everyone" };
	}
	return {
		amount: formatPrice(plan.monthlyPrice),
		caption: "per month",
	};
}

function highlightColumn(plan: (typeof pricingPlans)[number]) {
	return plan.highlighted
		? "border-stroke-soft-200 border-x bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]"
		: "";
}

function ComparisonTable() {
	return (
		<div className="overflow-x-auto lg:overflow-visible">
			<div className={cn("grid min-w-[760px]", COMPARISON_GRID_COLS)}>
				<div className="sticky top-16 z-20 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95" />
				{pricingPlans.map((plan) => {
					const price = comparisonPriceLine(plan);
					return (
						<div
							key={plan.id}
							className="sticky top-16 z-20 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95"
						>
							<div
								className={cn(
									"flex flex-col gap-4 px-4 py-5",
									plan.highlighted &&
										"rounded-t-2xl border-stroke-soft-200 border-x border-t bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]",
								)}
							>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-medium text-label-md text-text-strong-950 dark:text-white">
											{plan.name}
										</span>
										{plan.badge ? (
											<span className="shrink-0 rounded-full bg-primary-base px-2 py-0.5 text-center font-semibold text-[10px] text-white uppercase tracking-[0.14em]">
												{plan.badge}
											</span>
										) : null}
									</div>
									<div className="mt-2 flex items-baseline gap-1.5">
										<span className="font-semibold text-text-strong-950 text-title-h6 dark:text-white">
											{price.amount}
										</span>
										<span className="text-paragraph-xs text-text-sub-600 dark:text-white/50">
											{price.caption}
										</span>
									</div>
								</div>
							</div>
						</div>
					);
				})}

				{comparisonSections.map((section, sectionIndex) => (
					<Fragment key={section.title}>
						<div className={cn("pb-3", sectionIndex > 0 ? "pt-10" : "pt-6")}>
							<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
								{section.title}
							</span>
						</div>
						{pricingPlans.map((plan) => (
							<div
								key={plan.id}
								className={cn(
									sectionIndex > 0 ? "pt-10" : "pt-6",
									"pb-3",
									highlightColumn(plan),
								)}
							/>
						))}

						{section.rows.map((row) => (
							<Fragment key={row.key}>
								<div className="flex items-center border-stroke-soft-200 border-b py-4 pr-8 dark:border-white/[0.06]">
									<span className="text-[14px] text-text-sub-600 dark:text-white/55">
										{row.label}
									</span>
								</div>
								{pricingPlans.map((plan) => {
									const value = plan.comparison[row.key];
									return (
										<div
											key={plan.id}
											className={cn(
												"flex items-center border-stroke-soft-200 border-b px-3 py-4 dark:border-white/[0.06]",
												highlightColumn(plan),
											)}
										>
											<ComparisonCell
												value={value as string | boolean}
												type={row.type}
											/>
										</div>
									);
								})}
							</Fragment>
						))}
					</Fragment>
				))}

				<div />
				{pricingPlans.map((plan) => (
					<div
						key={`cap-${plan.id}`}
						className={cn(
							"h-8",
							plan.highlighted && "rounded-b-2xl border-b",
							highlightColumn(plan),
						)}
					/>
				))}
			</div>
		</div>
	);
}

export function PricingSection() {
	return (
		<>
			<div className="-mx-4 sm:-mx-6 lg:-mx-8 border-stroke-soft-200 border-y sm:grid sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{pricingPlans.map((plan, index) => (
					<PlanColumn key={plan.id} plan={plan} index={index} />
				))}
			</div>
			<div className="mt-24">
				<ComparisonTable />
			</div>
		</>
	);
}
