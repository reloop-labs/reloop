"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	comparisonRows,
	formatPrice,
	getPlanPrice,
	pricingPlans,
} from "@reloop/web/lib/pricing";
import Link from "next/link";

function PlanCard({
	plan,
}: {
	plan: (typeof pricingPlans)[number];
}) {
	const price = getPlanPrice(plan);
	const isCustom = price === null;

	return (
		<div
			className={cn(
				"relative flex flex-col rounded-3xl border p-6 sm:p-8",
				plan.highlighted
					? "border-primary-base bg-[#0a0d12] text-white shadow-lg shadow-primary-base/10 dark:border-primary-base"
					: "border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10",
			)}
		>
			{plan.highlighted && (
				<span className="-translate-y-1/2 absolute top-0 right-6 rounded-full bg-primary-base px-3 py-1 font-semibold text-[11px] text-white uppercase tracking-[0.12em]">
					Most popular
				</span>
			)}

			<div>
				<h3
					className={cn(
						"font-semibold text-lg",
						plan.highlighted
							? "text-white"
							: "text-text-strong-950 dark:text-white",
					)}
				>
					{plan.name}
				</h3>
				<p
					className={cn(
						"mt-2 text-[14px] leading-relaxed",
						plan.highlighted
							? "text-white/60"
							: "text-text-sub-600 dark:text-white/50",
					)}
				>
					{plan.description}
				</p>
			</div>

			<div className="mt-6">
				{isCustom ? (
					<p
						className={cn(
							"font-serif text-[2.4rem] leading-none tracking-tighter",
							plan.highlighted
								? "text-white"
								: "text-text-strong-950 dark:text-white",
						)}
					>
						Custom
					</p>
				) : (
					<div className="flex items-end gap-1">
						<span
							className={cn(
								"font-serif text-[2.8rem] leading-none tracking-tighter",
								plan.highlighted
									? "text-white"
									: "text-text-strong-950 dark:text-white",
							)}
						>
							{formatPrice(price)}
						</span>
						<span
							className={cn(
								"mb-1 text-[14px]",
								plan.highlighted
									? "text-white/50"
									: "text-text-sub-600 dark:text-white/50",
							)}
						>
							/ month
						</span>
					</div>
				)}
				<p
					className={cn(
						"mt-2 font-medium text-[14px]",
						plan.highlighted ? "text-primary-base" : "text-primary-base",
					)}
				>
					{plan.emailsLabel}
				</p>
			</div>

			<ul className="mt-8 space-y-3">
				{plan.features.map((feature) => (
					<li
						key={feature}
						className="flex items-start gap-3 text-[14px] leading-snug"
					>
						<Icon
							name="check"
							className={cn(
								"mt-0.5 size-4 shrink-0",
								plan.highlighted ? "text-primary-base" : "text-primary-base",
							)}
						/>
						<span
							className={
								plan.highlighted
									? "text-white/80"
									: "text-text-sub-600 dark:text-white/70"
							}
						>
							{feature}
						</span>
					</li>
				))}
			</ul>

			<div className="mt-8">
				<Link
					href={plan.ctaHref}
					target={plan.ctaExternal ? "_blank" : undefined}
					rel={plan.ctaExternal ? "noopener noreferrer" : undefined}
					className={cn(
						"inline-flex h-12 w-full items-center justify-center rounded-2xl font-semibold text-[15px] transition-colors",
						plan.highlighted
							? "bg-white text-[#0a0d12] hover:bg-white/90"
							: "bg-[#0a0d12] text-white hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
					)}
				>
					{plan.ctaLabel}
				</Link>
			</div>
		</div>
	);
}

function ComparisonTable() {
	return (
		<div className="overflow-hidden rounded-3xl border border-stroke-soft-200 dark:border-white/10">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[720px] text-left text-[14px]">
					<thead>
						<tr className="border-stroke-soft-200 border-b bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03]">
							<th className="px-5 py-4 font-semibold text-text-strong-950 dark:text-white">
								Compare plans
							</th>
							{pricingPlans.map((plan) => (
								<th
									key={plan.id}
									className="px-5 py-4 font-semibold text-text-strong-950 dark:text-white"
								>
									{plan.name}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-stroke-soft-200 dark:divide-white/10">
						<tr className="bg-bg-weak-50/50 dark:bg-white/[0.02]">
							<td className="px-5 py-4 font-medium text-text-sub-600 dark:text-white/50">
								Price
							</td>
							{pricingPlans.map((plan) => {
								const price = getPlanPrice(plan);
								return (
									<td
										key={plan.id}
										className="px-5 py-4 font-semibold text-text-strong-950 dark:text-white"
									>
										{price === null
											? "Custom"
											: price === 0
												? "Free"
												: `${formatPrice(price)}/mo`}
									</td>
								);
							})}
						</tr>
						{comparisonRows.map((row) => (
							<tr key={row.key}>
								<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
									{row.label}
								</td>
								{pricingPlans.map((plan) => {
									const value = plan.comparison[row.key];
									return (
										<td key={plan.id} className="px-5 py-4">
											{row.type === "boolean" ? (
												value ? (
													<Icon
														name="check"
														className="size-4 text-primary-base"
													/>
												) : (
													<span className="text-text-sub-600 dark:text-white/30">
														—
													</span>
												)
											) : (
												<span className="font-medium text-text-strong-950 dark:text-white">
													{value as string}
												</span>
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export function PricingSection() {
	return (
		<>
			<div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
				{pricingPlans.map((plan) => (
					<PlanCard key={plan.id} plan={plan} />
				))}
			</div>

			<div className="mt-16">
				<ComparisonTable />
			</div>
		</>
	);
}
