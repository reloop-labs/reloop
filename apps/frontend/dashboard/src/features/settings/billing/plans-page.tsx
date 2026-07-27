import { buildAppHref } from "#/lib/navigation-url";
import { useRouter } from "next/navigation";
import {
	comparisonSections,
	formatPrice,
	type PlanId,
	type PricingPlan,
	pricingPlans,
} from "@reloop/pricing";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";

import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { requestPlanSupport } from "./request-support";
import { useBillingUsage } from "./use-billing-usage";

function resolvePlanId(name: string | undefined): PlanId {
	const normalized = (name ?? "free").toLowerCase();
	const match = pricingPlans.find((p) => p.id === normalized);
	return match?.id ?? "free";
}

function planIndex(id: PlanId): number {
	return pricingPlans.findIndex((p) => p.id === id);
}

const GRID_COLS = "grid-cols-[minmax(160px,240px)_repeat(4,minmax(150px,1fr))]";

export function PlansPage() {
	const router = useRouter();
	const { data: usageData } = useBillingUsage();

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
		requestPlanSupport(message);
	};

	const currentPlanId = resolvePlanId(usageData?.plan?.name);
	const currentIndex = planIndex(currentPlanId);
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
				<FancyButton.Root
					variant="basic"
					size="small"
					className="w-full rounded-full font-semibold opacity-60"
					disabled
				>
					Current plan
				</FancyButton.Root>
			);
		}

		if (plan.monthlyPrice === null) {
			return (
				<FancyButton.Root
					variant="basic"
					size="small"
					className="w-full rounded-full font-semibold"
					onClick={() => requestPlan(plan, "enterprise")}
				>
					Contact sales
				</FancyButton.Root>
			);
		}

		const isUpgrade = index > currentIndex;
		const isNext = index === nextIndex;
		return (
			<FancyButton.Root
				variant={isNext ? "blue" : "basic"}
				size="small"
				className="w-full rounded-full font-semibold"
				onClick={() => requestPlan(plan, isUpgrade ? "upgrade" : "downgrade")}
			>
				{isUpgrade ? "Upgrade" : "Downgrade"}
			</FancyButton.Root>
		);
	}

	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
			<div className="mb-6">
				<AnimatedBackButton
					label="Billing"
					showEscKey={false}
					onClick={() =>
						router.push(buildAppHref({ to: "/settings/billing", search: { from: undefined } }))
					}
				/>
			</div>

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
						onClick={() =>
							requestPlanSupport(
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

			<div className="mb-12 overflow-x-auto pb-4 lg:overflow-visible">
				<div className={cn("grid min-w-[900px]", GRID_COLS)}>
					<div className="sticky top-0 z-20 border-stroke-soft-100 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]/95" />
					{pricingPlans.map((plan) => {
						const price = priceLine(plan);
						return (
							<div
								key={plan.id}
								className="sticky top-0 z-20 border-stroke-soft-100 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]/95"
							>
								<div
									className={cn(
										"flex flex-col gap-4 p-4",
										isHighlight(plan) && "rounded-t-2xl border-t",
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
							</div>
						);
					})}

					{comparisonSections.map((section) => (
						<div key={section.title} className="contents">
							<div className="pt-8 pb-3">
								<span className="font-medium text-label-sm text-text-strong-950">
									{section.title}
								</span>
							</div>
							{pricingPlans.map((plan) => (
								<div key={plan.id} className={cn("pt-8 pb-3", cellBg(plan))} />
							))}

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
			<span className="font-medium text-paragraph-sm text-text-soft-400">
				—
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
