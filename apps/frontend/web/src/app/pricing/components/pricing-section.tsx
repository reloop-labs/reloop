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
				name="arrow-left"
				className="ml-0 size-4 max-w-0 shrink-0 translate-x-1 rotate-180 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-4 group-hover:translate-x-0 group-hover:opacity-100"
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

function PlanColumn({ plan }: { plan: (typeof pricingPlans)[number] }) {
	const price = getPlanPrice(plan);
	const isCustom = price === null;

	return (
		<div
			className={cn(
				"flex min-h-[640px] flex-col border-stroke-soft-200 border-r border-b p-8 sm:min-h-[680px] lg:p-10 dark:border-white/10",
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
					<p className="mt-2 text-[14px] text-text-sub-600 dark:text-white/45">
						{isCustom || price === 0 ? plan.priceSubline : plan.emailsLabel}
					</p>
				</div>
			</div>

			<ul className="mt-10 flex-1 space-y-3">
				{plan.includesLabel && (
					<li className="flex items-start gap-3 text-[14px] leading-snug">
						<Icon
							name="check-circle"
							className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/35"
						/>
						<span className="font-medium text-text-strong-950 dark:text-white/85">
							{plan.includesLabel}
						</span>
					</li>
				)}
				{plan.features.map((feature) => (
					<li
						key={feature}
						className="flex items-start gap-3 text-[14px] leading-snug"
					>
						<Icon
							name="check-circle"
							className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/35"
						/>
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

function ComparisonTable() {
	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[760px] border-collapse">
				<thead>
					<tr>
						<th className="w-[34%] pb-8" aria-hidden />
						{pricingPlans.map((plan) => (
							<th
								key={plan.id}
								className="pb-8 text-left font-semibold text-[15px] text-text-strong-950 dark:text-white"
							>
								{plan.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{comparisonSections.map((section, sectionIndex) => (
						<Fragment key={section.title}>
							<tr>
								<td
									colSpan={pricingPlans.length + 1}
									className={cn(
										"pb-4 font-medium text-[15px] text-text-strong-950 dark:text-white",
										sectionIndex > 0 ? "pt-10" : "pt-2",
									)}
								>
									{section.title}
								</td>
							</tr>
							{section.rows.map((row) => (
								<tr
									key={row.key}
									className="group border-stroke-soft-200 border-b transition-colors last:border-b-0 hover:bg-bg-weak-50/60 dark:border-white/[0.06] dark:hover:bg-white/[0.04]"
								>
									<td className="py-4 pr-8 text-[14px] text-text-sub-600 dark:text-white/45">
										{row.label}
									</td>
									{pricingPlans.map((plan) => {
										const value = plan.comparison[row.key];
										return (
											<td key={plan.id} className="py-4">
												<ComparisonCell
													value={value as string | boolean}
													type={row.type}
												/>
											</td>
										);
									})}
								</tr>
							))}
						</Fragment>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function PricingSection() {
	return (
		<>
			<div className="overflow-hidden rounded-4xl border-stroke-soft-200 border-t border-l sm:grid sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{pricingPlans.map((plan) => (
					<PlanColumn key={plan.id} plan={plan} />
				))}
			</div>

			<div className="mt-24">
				<ComparisonTable />
			</div>
		</>
	);
}
