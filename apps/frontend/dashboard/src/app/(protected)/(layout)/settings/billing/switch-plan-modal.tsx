"use client";

import {
	defaultPlan,
	formatPrice,
	type PlanId,
	pricingPlans,
} from "@reloop/pricing";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SwitchPlanModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentPlanId: PlanId;
	userCount: number | string;
}

function planPriceLabel(plan: (typeof pricingPlans)[number]): string {
	if (plan.monthlyPrice === null) return "Contact sales";
	if (plan.monthlyPrice === 0) return "$0 per month";
	return `${formatPrice(plan.monthlyPrice)} per month`;
}

export const SwitchPlanModal = ({
	open,
	onOpenChange,
	currentPlanId,
	userCount,
}: SwitchPlanModalProps) => {
	const router = useRouter();
	const [selectedId, setSelectedId] = useState<PlanId>(currentPlanId);

	// Reset the selection to the current plan whenever the modal is opened
	useEffect(() => {
		if (open) setSelectedId(currentPlanId);
	}, [open, currentPlanId]);

	const selectedPlan =
		pricingPlans.find((p) => p.id === selectedId) ?? defaultPlan;

	const goToPlans = () => {
		onOpenChange(false);
		router.push("/plans");
	};

	const handleSwitch = () => {
		toast.info("Plan changes aren't available yet — contact us to switch.");
		onOpenChange(false);
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-[820px]" showClose={false}>
				{/* Header */}
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-5 py-4 dark:border-stroke-soft-100/40">
					<Modal.Title className="text-label-md text-text-strong-950">
						Switch plan
					</Modal.Title>
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={goToPlans}
							className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
						>
							<Icon name="external-link" className="h-4 w-4" />
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

				{/* Body */}
				<div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[300px_1fr]">
					{/* Plan list */}
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
										"rounded-xl border p-4 text-left transition-colors",
										isSelected
											? "border-primary-base bg-primary-alpha-10"
											: "border-stroke-soft-100 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40",
									)}
								>
									<div className="flex items-center gap-2">
										<span className="font-medium text-label-sm text-text-strong-950">
											{plan.name}
										</span>
										{isCurrent && (
											<Badge.Root size="small" variant="lighter" color="gray">
												Current plan
											</Badge.Root>
										)}
									</div>
									<p className="mt-1 text-paragraph-sm text-text-sub-600">
										{planPriceLabel(plan)}
									</p>
								</button>
							);
						})}
					</div>

					{/* Included features */}
					<div>
						<p className="text-paragraph-sm text-text-sub-600">
							Included features
						</p>
						<ul className="mt-4 space-y-3.5">
							{selectedPlan.features.map((feature) => (
								<li key={feature} className="flex items-start gap-2.5">
									<Icon
										name="check"
										className="mt-0.5 h-4 w-4 shrink-0 text-text-strong-950"
									/>
									<span className="text-paragraph-sm text-text-strong-950">
										{feature}
									</span>
								</li>
							))}
							<li>
								<button
									type="button"
									onClick={goToPlans}
									className="inline-flex items-center gap-2 text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
								>
									<Icon name="external-link" className="h-4 w-4 shrink-0" />
									Full feature list
								</button>
							</li>
						</ul>
					</div>
				</div>

				{/* Footer */}
				<Modal.Footer className="border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<div className="flex items-center gap-8">
						<div>
							<p className="text-paragraph-xs text-text-sub-600">Plan</p>
							<p className="font-medium text-label-sm text-text-strong-950">
								{selectedPlan.name}
							</p>
						</div>
						<div>
							<p className="text-paragraph-xs text-text-sub-600">Users</p>
							<p className="font-medium text-label-sm text-text-strong-950">
								{userCount}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button.Root>
						<Button.Root
							type="button"
							variant="primary"
							mode="filled"
							size="small"
							disabled={selectedId === currentPlanId}
							onClick={handleSwitch}
						>
							Switch plan
						</Button.Root>
					</div>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
