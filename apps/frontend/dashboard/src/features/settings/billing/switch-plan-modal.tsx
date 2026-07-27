import NumberFlow from "@number-flow/react";
import {
	defaultPlan,
	formatPrice,
	type PlanId,
	type PricingPlan,
	pricingPlans,
} from "@reloop/pricing";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { useNavigate } from "#/lib/navigation";
import { useEffect, useState } from "react";
import { requestPlanSupport } from "./request-support";

type StringComparisonKey = {
	[K in keyof PricingPlan["comparison"]]: PricingPlan["comparison"][K] extends string
		? K
		: never;
}[keyof PricingPlan["comparison"]];

const NUMERIC_FEATURES: Array<{
	id: string;
	key: StringComparisonKey;
	suffix: string;
}> = [
	{ id: "emails", key: "monthlyEmails", suffix: "emails per month" },
	{ id: "inboxes", key: "agentInbox", suffix: "agent inboxes" },
	{ id: "webhooks", key: "webhooks", suffix: "webhooks" },
	{ id: "domains", key: "customDomains", suffix: "custom domains" },
	{ id: "attachments", key: "attachmentSize", suffix: "MB attachments" },
];

const STATIC_FEATURES: string[] = [];

function toNumber(value: string): number {
	const digits = value.replace(/[^0-9]/g, "");
	return digits ? Number.parseInt(digits, 10) : 0;
}

function FeatureItem({ children }: { children: React.ReactNode }) {
	return (
		<li className="flex items-start gap-2.5">
			<Icon
				name="check-circle"
				className="mt-0.5 h-4 w-4 shrink-0 text-text-sub-600"
			/>
			<span className="flex items-center gap-1 text-paragraph-sm text-text-strong-950">
				{children}
			</span>
		</li>
	);
}

interface SwitchPlanModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentPlanId: PlanId;
}

function renderPlanPrice(plan: (typeof pricingPlans)[number]) {
	if (plan.monthlyPrice === null) {
		return (
			<span className="font-medium text-text-strong-950">Contact sales</span>
		);
	}
	return (
		<>
			<span className="font-medium text-text-strong-950">
				{formatPrice(plan.monthlyPrice)}
			</span>
			<span className="font-normal text-text-sub-600"> per month</span>
		</>
	);
}

export function SwitchPlanModal({
	open,
	onOpenChange,
	currentPlanId,
}: SwitchPlanModalProps) {
	const navigate = useNavigate();
	const [selectedId, setSelectedId] = useState<PlanId>(currentPlanId);

	useEffect(() => {
		if (open) setSelectedId(currentPlanId);
	}, [open, currentPlanId]);

	const selectedPlan =
		pricingPlans.find((p) => p.id === selectedId) ?? defaultPlan;
	const isEnterprise = selectedPlan.monthlyPrice === null;

	const goToPlans = () => {
		onOpenChange(false);
		void navigate({
			to: "/settings/billing/plans",
			search: { from: undefined },
		});
	};

	const handleSwitch = () => {
		const priceStr =
			selectedPlan.monthlyPrice === null
				? "custom pricing"
				: `${formatPrice(selectedPlan.monthlyPrice)}/month`;
		const message =
			selectedPlan.monthlyPrice === null
				? "Hi! I'm interested in the Enterprise plan. Can you help me get set up?"
				: `Hi! I'd like to switch to the ${selectedPlan.name} plan (${priceStr}). Can you help me with that?`;
		requestPlanSupport(message);
		onOpenChange(false);
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-[820px]" showClose={false}>
				<div className="flex items-center justify-between px-5 py-4">
					<Modal.Title className="font-semibold text-text-strong-950 text-title-h6">
						Switch plan
					</Modal.Title>
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={goToPlans}
							className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
						>
							<Icon name="arrow-up-right" className="h-4 w-4" />
							Compare plans
						</button>
						<Modal.Close asChild>
							<button
								type="button"
								className="flex size-6 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
								aria-label="Close"
							>
								<Icon name="plus" className="h-4 w-4 rotate-45" />
							</button>
						</Modal.Close>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[300px_1fr]">
					<div className="flex flex-col gap-2">
						{pricingPlans.map((plan) => {
							const isSelected = plan.id === selectedId;
							const isCurrent = plan.id === currentPlanId;
							return (
								<button
									key={plan.id}
									type="button"
									onClick={() => setSelectedId(plan.id)}
									className={cn(
										"rounded-2xl border p-4 text-left transition-colors",
										isSelected
											? "border-text-strong-950 bg-bg-weak-50 dark:border-white dark:bg-white/[0.06]"
											: "border-stroke-soft-100 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40",
									)}
								>
									<div className="flex items-center gap-2">
										<span className="font-medium text-label-sm text-text-strong-950">
											{plan.name}
										</span>
										{isCurrent && (
											<span className="inline-flex h-5 items-center rounded-full bg-bg-weak-50 px-2 font-medium text-label-xs text-text-sub-600 dark:bg-white/[0.06]">
												Current plan
											</span>
										)}
									</div>
									<p className="text-[12px] text-text-sub-600">
										{renderPlanPrice(plan)}
									</p>
								</button>
							);
						})}
					</div>

					<div>
						<p className="text-paragraph-sm text-text-sub-600">
							Included features
						</p>
						<ul className="mt-4 min-h-[380px] space-y-3.5">
							{isEnterprise
								? selectedPlan.features.map((feature) => (
										<FeatureItem key={feature}>{feature}</FeatureItem>
									))
								: [
										...NUMERIC_FEATURES.map((row) => (
											<FeatureItem key={row.id}>
												<NumberFlow
													value={toNumber(selectedPlan.comparison[row.key])}
													className="font-medium tabular-nums"
													transformTiming={{
														duration: 500,
														easing: "ease-out",
													}}
												/>
												{row.suffix}
											</FeatureItem>
										)),
										...STATIC_FEATURES.map((feature) => (
											<FeatureItem key={feature}>{feature}</FeatureItem>
										)),
										<FeatureItem key="support">
											{selectedPlan.comparison.support} support
										</FeatureItem>,
									]}
							<li>
								<button
									type="button"
									onClick={goToPlans}
									className="inline-flex items-center gap-2 text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
								>
									<Icon name="arrow-up-right" className="h-4 w-4 shrink-0" />
									Full feature list
								</button>
							</li>
						</ul>
					</div>
				</div>

				<Modal.Footer className="border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<div>
						<p className="text-paragraph-xs text-text-sub-600">Plan</p>
						<p className="font-medium text-label-sm text-text-strong-950">
							{selectedPlan.name}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="blue"
							size="small"
							className="font-medium"
							disabled={selectedId === currentPlanId}
							onClick={handleSwitch}
						>
							Switch plan
						</FancyButton.Root>
					</div>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
}
