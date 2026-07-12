"use client";

import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { useBillingUsage } from "@fe/dashboard/hooks/useBillingUsage";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import {
	comparisonSections,
	formatPrice,
	type PlanId,
	type PricingPlan,
	pricingPlans,
} from "@reloop/pricing";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";

function resolvePlanId(name: string | undefined): PlanId {
	const normalized = (name ?? "free").toLowerCase();
	const match = pricingPlans.find((p) => p.id === normalized);
	return match?.id ?? "free";
}

function planIndex(id: PlanId): number {
	return pricingPlans.findIndex((p) => p.id === id);
}

const GRID_COLS = "grid-cols-[minmax(160px,240px)_repeat(4,minmax(150px,1fr))]";

const PlansPage = () => {
	const router = useRouter();
	const setIsAiPanelOpen = useUIStore((s) => s.setIsAiPanelOpen);
	const setAiPanelActiveTab = useUIStore((s) => s.setAiPanelActiveTab);
	const setPendingSupportMessage = useUIStore(
		(s) => s.setPendingSupportMessage,
	);
	const { data: usageData } = useBillingUsage();

	const openSupport = () => {
		setAiPanelActiveTab("support");
		setIsAiPanelOpen(true);
	};

	const requestPlan = (
		plan: PricingPlan,
		action: "upgrade" | "downgrade" | "enterprise",
	) => {
		const priceStr =
			plan.monthlyPrice === null
				? "custom pricing"
				: `${formatPrice(plan.monthlyPrice)}/month`;
		const message =
			action === "enterprise"
				? "Hi! I'm interested in the Enterprise plan. Can you help me get set up?"
				: `Hi! I'd like to ${action} to the ${plan.name} plan (${priceStr}). Can you help me with that?`;
		setPendingSupportMessage(message);
		openSupport();
	};

	const currentPlanId = resolvePlanId(usageData?.plan?.name);
	const currentIndex = planIndex(currentPlanId);

	// Emphasize the next plan the user can upgrade to (matches the marketing
	// pricing page highlight color).
	const nextIndex = currentIndex + 1;

	const isHighlight = (plan: PricingPlan) => planIndex(plan.id) === nextIndex;

	const cellBg = (plan: PricingPlan) =>
		isHighlight(plan)
			? "border-stroke-soft-200 border-x bg-bg-weak-50/60 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
			: "";

	function priceLine(plan: PricingPlan) {
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

	function renderCta(plan: PricingPlan) {
		const index = planIndex(plan.id);

		if (index === currentIndex) {
			return (
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					className="w-full rounded-full font-semibold"
					disabled
				>
					Current plan
				</Button.Root>
			);
		}

		if (plan.monthlyPrice === null) {
			return (
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					className="w-full rounded-full font-semibold"
					onClick={() => requestPlan(plan, "enterprise")}
				>
					Contact sales
				</Button.Root>
			);
		}

		const isUpgrade = index > currentIndex;
		const isNext = index === nextIndex;
		return (
			<Button.Root
				variant="neutral"
				mode={isNext ? "filled" : "stroke"}
				size="small"
				className="w-full rounded-full font-semibold"
				onClick={() => requestPlan(plan, isUpgrade ? "upgrade" : "downgrade")}
			>
				{isUpgrade ? "Upgrade" : "Downgrade"}
			</Button.Root>
		);
	}

	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
			{/* Back to billing */}
			<div className="mb-6">
				<AnimatedBackButton
					label="Billing"
					showEscKey={false}
					onClick={() => router.push("/settings/billing")}
				/>
			</div>

			{/* Header */}
			<div className="mb-8">
				<h1 className="font-semibold text-text-strong-950 text-title-h5">
					Plans
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					You are on the{" "}
					<span className="font-medium text-text-strong-950">
						{pricingPlans[currentIndex]?.name ?? "Free"} plan
					</span>
					. If you have any questions or would like further support with your
					plan,{" "}
					<button
						type="button"
						onClick={openSupport}
						className="inline-flex items-center gap-1 font-medium text-text-strong-950 hover:text-text-sub-600"
					>
						contact us
						<Icon name="arrow-right" className="h-3 w-3" />
					</button>
				</p>
			</div>

			{/* Comparison table */}
			<div className="mb-12 overflow-x-auto pb-4">
				<div className={cn("grid min-w-[900px]", GRID_COLS)}>
					{/* Plan header row */}
					<div className="border-stroke-soft-100 border-b dark:border-stroke-soft-100/40" />
					{pricingPlans.map((plan) => {
						const price = priceLine(plan);
						return (
							<div
								key={plan.id}
								className={cn(
									"flex flex-col gap-4 rounded-t-2xl border-stroke-soft-100 border-b p-4 dark:border-stroke-soft-100/40",
									isHighlight(plan) && "border-t",
									cellBg(plan),
								)}
							>
								<div>
									<h2 className="font-medium text-label-md text-text-strong-950">
										{plan.name}
									</h2>
									<div className="mt-2 flex items-baseline gap-1.5">
										<span className="font-semibold text-text-strong-950 text-title-h6">
											{price.amount}
										</span>
										<span className="text-paragraph-xs text-text-sub-600">
											{price.caption}
										</span>
									</div>
								</div>
								{renderCta(plan)}
							</div>
						);
					})}

					{/* Sections */}
					{comparisonSections.map((section) => (
						<div key={section.title} className="contents">
							{/* Section title row */}
							<div className="pt-8 pb-3">
								<span className="font-medium text-label-sm text-text-strong-950">
									{section.title}
								</span>
							</div>
							{pricingPlans.map((plan) => (
								<div key={plan.id} className={cn("pt-8 pb-3", cellBg(plan))} />
							))}

							{/* Feature rows */}
							{section.rows.map((row) => (
								<div key={row.key} className="contents">
									<div className="flex items-center border-stroke-soft-100 border-b py-3 pr-4 dark:border-stroke-soft-100/40">
										<span className="text-paragraph-sm text-text-sub-600">
											{row.label}
										</span>
									</div>
									{pricingPlans.map((plan) => {
										const value = plan.comparison[row.key];
										return (
											<div
												key={plan.id}
												className={cn(
													"flex items-center border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40",
													cellBg(plan),
												)}
											>
												<ComparisonCell value={value} type={row.type} />
											</div>
										);
									})}
								</div>
							))}
						</div>
					))}

					{/* Bottom cap so the highlighted column reads as an independent
					    rounded block */}
					<div />
					{pricingPlans.map((plan) => (
						<div
							key={`cap-${plan.id}`}
							className={cn(
								"h-8 rounded-b-2xl",
								isHighlight(plan) && "border-b",
								cellBg(plan),
							)}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

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
			<span className="font-medium text-paragraph-sm text-text-soft-400">
				—
			</span>
		);
	}

	if (type === "boolean") {
		return (
			<Icon
				name="check-mark"
				className="h-4 w-4 shrink-0 text-text-strong-950"
			/>
		);
	}

	return (
		<span className="inline-flex items-center gap-2 font-medium text-paragraph-sm text-text-strong-950">
			<Icon name="check-mark" className="h-4 w-4 shrink-0 text-text-sub-600" />
			{value as string}
		</span>
	);
}

export default PlansPage;
