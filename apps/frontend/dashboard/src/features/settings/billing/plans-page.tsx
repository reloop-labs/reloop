import {
	type ComparisonSection,
	comparisonSections,
	creditPack,
	creditPackSizes,
	formatPrice,
	getPlanById,
	isCheckoutPlanId,
	type PlanId,
	type PricingPlan,
	paidOverageUsdPerThousand,
	planDisplayName,
	pricingPlans,
	recommendPlanIdForVolume,
} from "@reloop/pricing";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { openHelpWithMessage } from "#/features/help/open-help";
import { resolvePlanId } from "./plan-id";
import { StepSlider } from "./step-slider";
import { BILLING_MODES, type BillingMode } from "./switch-plan-modal";
import {
	contactEnterprise,
	useBillingCheckout,
	useBillingPortal,
	useCreditsCheckout,
} from "./use-billing-actions";
import { useBillingUsage } from "./use-billing-usage";

const CREDIT_VALIDITY_KEY = "creditValidity";
const DEFAULT_PACK = 10_000;

type RowKey = keyof PricingPlan["comparison"] | typeof CREDIT_VALIDITY_KEY;

type TableSection = {
	title: string;
	rows: Array<{ label: string; key: RowKey; type: "text" | "boolean" }>;
};

/** One plan column in the comparison table. */
type PlanColumn = {
	id: string;
	name: string;
	amount: string;
	caption: string;
	highlight: boolean;
	cta: ReactNode;
	value: (key: RowKey) => string | boolean;
};

const MONTHLY_VOLUMES = [
	3_000, 10_000, 20_000, 30_000, 40_000, 50_000, 100_000, 250_000, 500_000,
] as const;
const DEFAULT_MONTHLY_VOLUME = 50_000;

function includedEmails(plan: PricingPlan): number {
	return Number(plan.comparison.monthlyEmails.replace(/,/g, ""));
}

function planIndex(id: PlanId): number {
	return pricingPlans.findIndex((p) => p.id === id);
}

function comparisonOf(id: PlanId): PricingPlan["comparison"] {
	const plan = getPlanById(id);
	if (!plan) throw new Error(`Unknown plan: ${id}`);
	return plan.comparison;
}

function formatUsd(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

function priceLine(plan: PricingPlan) {
	if (plan.monthlyPrice === null) {
		return { amount: "Custom", caption: "pricing" };
	}
	if (plan.monthlyPrice === 0) {
		return { amount: formatPrice(0), caption: "Free for everyone" };
	}
	return { amount: formatPrice(plan.monthlyPrice), caption: "per month" };
}

/** Pay as you go adds a credit-validity row to the Volume section. */
const creditSections: TableSection[] = comparisonSections.map(
	(section: ComparisonSection): TableSection =>
		section.title === "Volume"
			? {
					...section,
					rows: [
						...section.rows.map((row) =>
							row.key === "monthlyEmails" ? { ...row, label: "Emails" } : row,
						),
						{
							label: "Credit validity",
							key: CREDIT_VALIDITY_KEY,
							type: "text",
						},
					],
				}
			: section,
);

export function PlansPage() {
	const router = useRouter();
	const { data: usageData } = useBillingUsage();
	const checkout = useBillingCheckout();
	const creditsCheckout = useCreditsCheckout();
	const portal = useBillingPortal();

	const currentPlanId = resolvePlanId({
		id: usageData?.plan.id ?? usageData?.subscription.planId,
		name: usageData?.plan.name,
	});
	const isPayg = currentPlanId === "payg";
	// Pay as you go is Free plus credits: compare upgrades from Free's column.
	const currentIndex = isPayg ? planIndex("free") : planIndex(currentPlanId);
	const nextIndex = currentIndex + 1;

	const [mode, setMode] = useState<BillingMode>("monthly");
	const [emails, setEmails] = useState(DEFAULT_PACK);
	const [volume, setVolume] = useState<number>(DEFAULT_MONTHLY_VOLUME);
	const recommendedId = recommendPlanIdForVolume(volume);
	// Credit users open on Pay as you go once their plan has loaded.
	useEffect(() => {
		if (isPayg) setMode("credits");
	}, [isPayg]);

	const isCredits = mode === "credits";
	const creditsPrice = (emails / 1000) * creditPack.usdPerThousand;

	function ctaButton(args: {
		label: string;
		primary?: boolean;
		disabled?: boolean;
		muted?: boolean;
		onClick?: () => void;
	}) {
		return (
			<FancyButton.Root
				variant={args.primary ? "neutral" : "basic"}
				size="small"
				className={cn(
					"w-full rounded-full font-semibold",
					args.muted && "opacity-60",
				)}
				disabled={args.disabled}
				onClick={args.onClick}
			>
				{args.label}
			</FancyButton.Root>
		);
	}

	function planCta(plan: PricingPlan) {
		const index = planIndex(plan.id);

		if (isPayg && plan.id === "free") {
			return ctaButton({ label: "Included", disabled: true, muted: true });
		}
		if (index === currentIndex) {
			return ctaButton({ label: "Current plan", disabled: true, muted: true });
		}
		if (plan.monthlyPrice === null) {
			return ctaButton({
				label: "Contact sales",
				onClick: () => contactEnterprise(router),
			});
		}
		if (plan.id === "free") {
			return ctaButton({
				label: portal.isPending ? "Opening…" : "Manage in portal",
				disabled: portal.isPending,
				onClick: () => portal.mutate(),
			});
		}
		const isCheckingOut = checkout.isPending && checkout.variables === plan.id;
		return ctaButton({
			label: isCheckingOut
				? "Redirecting…"
				: index > currentIndex
					? "Upgrade"
					: "Downgrade",
			primary: index === nextIndex,
			disabled: checkout.isPending,
			onClick: () => {
				if (isCheckoutPlanId(plan.id)) checkout.mutate(plan.id);
			},
		});
	}

	const buyCredits = () => creditsCheckout.mutate(emails);
	const buyLabel = creditsCheckout.isPending
		? "Redirecting…"
		: isPayg
			? "Buy more credits"
			: "Buy credits";

	const monthlyColumns: PlanColumn[] = pricingPlans.map((plan) => {
		const price = priceLine(plan);
		const recommended = plan.id === recommendedId;
		// Like the pricing page: the recommended plan shows its cost at the
		// picked volume, overage included.
		const extra =
			recommended && plan.monthlyPrice
				? (Math.max(0, volume - includedEmails(plan)) / 1000) *
					paidOverageUsdPerThousand
				: 0;
		return {
			id: plan.id,
			name: plan.name,
			amount:
				extra > 0 && plan.monthlyPrice != null
					? formatUsd(plan.monthlyPrice + extra)
					: price.amount,
			caption:
				extra > 0
					? `per month at ${volume.toLocaleString("en-US")} emails`
					: price.caption,
			highlight: recommended,
			cta: planCta(plan),
			value: (key) =>
				key === CREDIT_VALIDITY_KEY ? "-" : plan.comparison[key],
		};
	});

	const freePlan = getPlanById("free");
	const enterprisePlan = getPlanById("enterprise");
	const creditColumns: PlanColumn[] = [
		{
			id: "free",
			name: "Free",
			amount: formatPrice(0),
			caption: "Free for everyone",
			highlight: false,
			cta: freePlan ? planCta(freePlan) : null,
			value: (key) =>
				key === CREDIT_VALIDITY_KEY ? "-" : comparisonOf("free")[key],
		},
		{
			id: "payg",
			name: "Pay as you go",
			amount: formatUsd(creditsPrice),
			caption: "one-time",
			highlight: true,
			cta: ctaButton({
				label: buyLabel,
				primary: true,
				disabled: creditsCheckout.isPending,
				onClick: buyCredits,
			}),
			value: (key) => {
				if (key === CREDIT_VALIDITY_KEY) {
					return `${creditPack.validityMonths} months`;
				}
				if (key === "monthlyEmails") {
					return `${emails.toLocaleString("en-US")} credits`;
				}
				if (key === "overage") return "Top up anytime";
				return comparisonOf("individual")[key];
			},
		},
		{
			id: "enterprise",
			name: "Enterprise",
			amount: "Custom",
			caption: "pricing",
			highlight: false,
			cta: enterprisePlan ? planCta(enterprisePlan) : null,
			value: (key) =>
				key === CREDIT_VALIDITY_KEY
					? "Custom"
					: comparisonOf("enterprise")[key],
		},
	];

	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
			<div className="mb-6">
				<AnimatedBackButton
					label="Billing"
					showEscKey={false}
					onClick={() => router.push("/settings/billing")}
				/>
			</div>

			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h5">
					Plans
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					You are on the{" "}
					<span className="font-medium text-text-strong-950">
						{isPayg
							? planDisplayName(currentPlanId)
							: `${planDisplayName(currentPlanId)} plan`}
					</span>
					. If you have any questions or would like further support with your
					plan,{" "}
					<button
						type="button"
						onClick={() =>
							openHelpWithMessage(
								router,
								"Hi! I have a question about my plan. Can you help?",
							)
						}
						className="inline-flex items-center gap-1 font-medium text-text-strong-950 hover:text-text-sub-600"
					>
						contact us
						<Icon name="arrow-right" className="h-3 w-3" />
					</button>
				</p>
			</div>

			{/* One gap between every block (title, radios, slider, table) so the
			    vertical rhythm stays even. */}
			<div className="mt-16 flex flex-col gap-16">
				<div className="mx-auto w-full max-w-2xl">
					<fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<legend className="sr-only">Billing mode</legend>
						{BILLING_MODES.map((option) => {
							const active = mode === option.id;
							return (
								<label
									key={option.id}
									className={cn(
										"flex cursor-pointer items-start gap-2.5 rounded-2xl border p-4 transition-[border-color,box-shadow,background-color] duration-150",
										"has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-text-strong-950/20",
										active
											? "border-transparent bg-bg-white-0 shadow-xs ring-[1.5px] ring-text-strong-950 ring-inset dark:bg-white/[0.04] dark:ring-white"
											: "border-stroke-soft-100 bg-bg-weak-50/30 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]",
									)}
								>
									<input
										type="radio"
										name="billing-mode"
										value={option.id}
										checked={active}
										onChange={() => setMode(option.id)}
										className="sr-only"
									/>
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
									<span className="flex min-w-0 flex-col gap-0.5">
										<span className="font-medium text-label-sm text-text-strong-950">
											{option.label}
										</span>
										<span className="text-paragraph-xs text-text-sub-600">
											{option.description}
										</span>
									</span>
								</label>
							);
						})}
					</fieldset>
				</div>

				<div className="mx-auto w-full max-w-2xl">
					{isCredits ? (
						<StepSlider
							steps={creditPackSizes}
							value={emails}
							onChange={setEmails}
							ariaLabel="Number of emails"
						/>
					) : (
						<StepSlider
							steps={MONTHLY_VOLUMES}
							value={volume}
							onChange={setVolume}
							ariaLabel="Emails per month"
						/>
					)}
				</div>

				<div>
					<h2 className="font-medium text-label-md text-text-strong-950">
						Compare plans
					</h2>
					<ComparisonTable
						columns={isCredits ? creditColumns : monthlyColumns}
						sections={isCredits ? creditSections : comparisonSections}
					/>
				</div>
			</div>
		</div>
	);
}

const GRID_COLS: Record<number, string> = {
	3: "min-w-[720px] grid-cols-[minmax(160px,240px)_repeat(3,minmax(150px,1fr))]",
	4: "min-w-[900px] grid-cols-[minmax(160px,240px)_repeat(4,minmax(150px,1fr))]",
};

function ComparisonTable({
	columns,
	sections,
}: {
	columns: PlanColumn[];
	sections: TableSection[];
}) {
	const cellBg = (column: PlanColumn) =>
		column.highlight
			? "border-stroke-soft-200 border-x bg-bg-weak-50/60 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
			: "";

	return (
		<div className="mb-12 overflow-x-auto pb-4 lg:overflow-visible">
			<div className={cn("grid", GRID_COLS[columns.length])}>
				<div className="sticky top-0 z-20 border-stroke-soft-100 border-b bg-bg-white-0 dark:border-stroke-soft-100/40" />
				{columns.map((column) => (
					<div
						key={column.id}
						className="sticky top-0 z-20 border-stroke-soft-100 border-b bg-bg-white-0 dark:border-stroke-soft-100/40"
					>
						<div
							className={cn(
								"flex flex-col gap-4 p-4",
								column.highlight && "rounded-t-2xl border-t",
								cellBg(column),
							)}
						>
							<div>
								<h2 className="font-medium text-label-md text-text-strong-950">
									{column.name}
								</h2>
								<div className="mt-2 flex items-baseline gap-1.5">
									<span className="font-semibold text-text-strong-950 text-title-h6 tabular-nums">
										{column.amount}
									</span>
									<span className="text-paragraph-xs text-text-sub-600">
										{column.caption}
									</span>
								</div>
							</div>
							{column.cta}
						</div>
					</div>
				))}

				{sections.map((section) => (
					<div key={section.title} className="contents">
						<div className="pt-8 pb-3">
							<span className="font-medium text-label-sm text-text-strong-950">
								{section.title}
							</span>
						</div>
						{columns.map((column) => (
							<div
								key={column.id}
								className={cn("pt-8 pb-3", cellBg(column))}
							/>
						))}

						{section.rows.map((row) => (
							<div key={row.key} className="contents">
								<div className="flex items-center border-stroke-soft-100 border-b py-3 pr-4 dark:border-stroke-soft-100/40">
									<span className="text-paragraph-sm text-text-sub-600">
										{row.label}
									</span>
								</div>
								{columns.map((column) => (
									<div
										key={column.id}
										className={cn(
											"flex items-center border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40",
											cellBg(column),
										)}
									>
										<ComparisonCell
											value={column.value(row.key)}
											type={row.type}
										/>
									</div>
								))}
							</div>
						))}
					</div>
				))}

				<div />
				{columns.map((column) => (
					<div
						key={`cap-${column.id}`}
						className={cn(
							"h-8 rounded-b-2xl",
							column.highlight && "border-b",
							cellBg(column),
						)}
					/>
				))}
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
	const unavailable = type === "boolean" ? !value : value === "-";

	if (unavailable) {
		return (
			<span className="font-medium text-paragraph-sm text-text-soft-400">
				-
			</span>
		);
	}

	if (type === "boolean") {
		return (
			<Icon
				name="check-mark"
				className="h-3.5 w-3.5 shrink-0 text-text-strong-950"
			/>
		);
	}

	return (
		<span className="inline-flex items-center gap-2 font-medium text-paragraph-sm text-text-strong-950">
			<Icon
				name="check-mark"
				className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
			/>
			{value as string}
		</span>
	);
}
