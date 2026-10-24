import NumberFlow from "@number-flow/react";
import {
	creditPack,
	creditPackPriceCents,
	creditPackSizes,
	defaultPlan,
	formatPrice,
	type PlanId,
	type PricingPlan,
	planLimits,
	pricingPlans,
} from "@reloop/pricing";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import * as Slider from "@reloop/ui/slider";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import {
	contactEnterprise,
	useBillingCheckout,
	useCreditsCheckout,
} from "./use-billing-actions";

export type BillingMode = "monthly" | "credits";

const BILLING_MODES: Array<{
	id: BillingMode;
	label: string;
	description: string;
}> = [
	{
		id: "monthly",
		label: "Monthly plan",
		description: "Renews monthly. Best for steady sending.",
	},
	{
		id: "credits",
		label: "Pay as you go",
		description: `Pay once, no subscription. Credits last ${creditPack.validityMonths} months.`,
	},
];

const DEFAULT_PACK = 10_000;

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
	{ id: "inboxes", key: "agentInbox", suffix: "inboxes" },
	{ id: "webhooks", key: "webhooks", suffix: "webhooks" },
	{ id: "domains", key: "customDomains", suffix: "custom domains" },
	{ id: "attachments", key: "attachmentSize", suffix: "MB attachments" },
];

function toNumber(value: string): number {
	const digits = value.replace(/[^0-9]/g, "");
	return digits ? Number.parseInt(digits, 10) : 0;
}

function formatUsd(cents: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
		maximumFractionDigits: 2,
	}).format(cents / 100);
}

function formatDate(d: Date): string {
	return d.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function addMonths(from: Date, months: number): Date {
	const d = new Date(from);
	d.setMonth(d.getMonth() + months);
	return d;
}

const OPTION_BASE =
	"rounded-2xl border text-left transition-[border-color,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-strong-950/20";
const OPTION_SELECTED =
	"border-transparent bg-bg-white-0 shadow-xs ring-[1.5px] ring-text-strong-950 dark:bg-white/[0.04] dark:ring-white";
const OPTION_IDLE =
	"border-stroke-soft-100 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.04]";

// Thumb is 16px: radix insets it 8px at each end, so ticks follow it.
const THUMB_HALF = 8;
const LABELLED_PACKS = new Set([3_000, 10_000, 30_000, 50_000, 100_000]);
const PACK_STEPS = creditPackSizes.length - 1;

function tickLeft(index: number): string {
	const percent = (index / PACK_STEPS) * 100;
	const offset = THUMB_HALF - (percent * THUMB_HALF * 2) / 100;
	return `calc(${percent}% + ${offset}px)`;
}

function CreditPackSlider({
	emails,
	onChange,
}: {
	emails: number;
	onChange: (emails: number) => void;
}) {
	const found = creditPackSizes.findIndex((size) => size === emails);
	const index = found < 0 ? 0 : found;
	const priceCents = creditPackPriceCents(emails);

	return (
		<div className="flex flex-col">
			<p className="text-paragraph-sm text-text-sub-600">Emails</p>
			<p className="mt-2 font-semibold text-text-strong-950 text-title-h4 tabular-nums leading-none">
				<NumberFlow
					value={emails}
					locales="en-US"
					transformTiming={{ duration: 400, easing: "ease-out" }}
				/>
			</p>
			<p className="mt-2 text-paragraph-sm text-text-sub-600 tabular-nums">
				<NumberFlow
					value={priceCents / 100}
					locales="en-US"
					format={{
						style: "currency",
						currency: "USD",
						minimumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
						maximumFractionDigits: 2,
					}}
					className="font-medium text-text-strong-950"
				/>{" "}
				one-time
			</p>

			<div className="mt-8">
				<Slider.Root
					min={0}
					max={PACK_STEPS}
					step={1}
					value={[index]}
					onValueChange={(value) => {
						const next = creditPackSizes[value[0] ?? 0];
						if (next) onChange(next);
					}}
					aria-label="Number of emails"
				>
					<Slider.Thumb aria-label="Number of emails" />
				</Slider.Root>

				<div className="relative mt-1.5 h-9">
					{creditPackSizes.map((size, i) => {
						const active = i === index;
						const labelled = LABELLED_PACKS.has(size);
						return (
							<button
								key={size}
								type="button"
								tabIndex={-1}
								aria-label={`${size.toLocaleString("en-US")} emails`}
								onClick={() => onChange(size)}
								style={{ left: tickLeft(i) }}
								className={cn(
									"absolute top-0 flex flex-col gap-1 px-0.5",
									i === 0
										? "items-start"
										: i === PACK_STEPS
											? "-translate-x-full items-end"
											: "-translate-x-1/2 items-center",
								)}
							>
								<span
									aria-hidden
									className={cn(
										"h-1.5 w-px",
										active
											? "bg-text-strong-950"
											: "bg-stroke-soft-200 dark:bg-white/15",
									)}
								/>
								{labelled ? (
									<span
										className={cn(
											"text-[12px] tabular-nums",
											active
												? "font-semibold text-text-strong-950"
												: "text-text-soft-400",
										)}
									>
										{size / 1000}k
									</span>
								) : null}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
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

function SelectedCheck() {
	return (
		<span
			aria-hidden
			className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bg-strong-950 text-text-white-0"
		>
			<Check className="size-3" strokeWidth={3} />
		</span>
	);
}

function renderPlanPrice(plan: PricingPlan) {
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

interface SwitchPlanModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentPlanId: PlanId;
	/** Tab shown on open. Defaults to Pay as you go for credit users. */
	initialMode?: BillingMode;
	/** Expiry of credits the org already holds, if any. */
	creditsExpireAt?: string | null;
}

export function SwitchPlanModal({
	open,
	onOpenChange,
	currentPlanId,
	initialMode,
	creditsExpireAt,
}: SwitchPlanModalProps) {
	const router = useRouter();
	const openMode: BillingMode =
		initialMode ?? (currentPlanId === "payg" ? "credits" : "monthly");
	const [mode, setMode] = useState<BillingMode>(openMode);
	const [selectedId, setSelectedId] = useState<PlanId>(currentPlanId);
	const [emails, setEmails] = useState<number>(DEFAULT_PACK);

	useEffect(() => {
		if (!open) return;
		setMode(openMode);
		setSelectedId(currentPlanId);
		setEmails(DEFAULT_PACK);
	}, [open, openMode, currentPlanId]);

	const checkout = useBillingCheckout();
	const creditsCheckout = useCreditsCheckout();
	const selectedPlan =
		pricingPlans.find((p) => p.id === selectedId) ?? defaultPlan;
	const isEnterprise = selectedPlan.monthlyPrice === null;

	const priceCents = creditPackPriceCents(emails);
	// Buying again extends every credit the org already holds.
	const fresh = addMonths(new Date(), creditPack.validityMonths);
	const existing = creditsExpireAt ? new Date(creditsExpireAt) : null;
	const validUntil = existing && existing > fresh ? existing : fresh;
	const payg = planLimits.payg;

	const goToPlans = () => {
		onOpenChange(false);
		router.push("/settings/billing/plans");
	};

	const handleSwitch = () => {
		if (isEnterprise) {
			contactEnterprise(router);
			onOpenChange(false);
			return;
		}
		if (selectedPlan.id === "free") {
			onOpenChange(false);
			router.push("/settings/billing");
			return;
		}
		if (selectedPlan.id === "individual" || selectedPlan.id === "startup") {
			checkout.mutate(selectedPlan.id);
		}
	};

	const isCredits = mode === "credits";
	const pending = checkout.isPending || creditsCheckout.isPending;

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

				<div className="px-5">
					<div
						role="tablist"
						aria-label="Billing mode"
						className="grid grid-cols-1 gap-2 sm:grid-cols-2"
					>
						{BILLING_MODES.map((option) => {
							const active = mode === option.id;
							return (
								<button
									key={option.id}
									type="button"
									role="tab"
									aria-selected={active}
									onClick={() => setMode(option.id)}
									className={cn(
										OPTION_BASE,
										"flex items-start gap-3 p-4",
										active ? OPTION_SELECTED : OPTION_IDLE,
									)}
								>
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
										<span className="text-[12px] text-text-sub-600">
											{option.description}
										</span>
									</span>
								</button>
							);
						})}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[300px_1fr]">
					{isCredits ? (
						<div role="tabpanel" aria-label="Credit pack">
							<CreditPackSlider emails={emails} onChange={setEmails} />
						</div>
					) : (
						<div role="tabpanel" className="flex flex-col gap-2">
							{pricingPlans.map((plan) => {
								const isSelected = plan.id === selectedId;
								const isCurrent = plan.id === currentPlanId;
								return (
									<button
										key={plan.id}
										type="button"
										onClick={() => setSelectedId(plan.id)}
										aria-pressed={isSelected}
										className={cn(
											OPTION_BASE,
											"flex items-center justify-between gap-3 p-4",
											isSelected ? OPTION_SELECTED : OPTION_IDLE,
										)}
									>
										<div className="min-w-0">
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
										</div>
										{isSelected ? <SelectedCheck /> : null}
									</button>
								);
							})}
						</div>
					)}

					<div>
						<p className="text-paragraph-sm text-text-sub-600">
							Included features
						</p>
						<ul className="mt-4 min-h-[380px] space-y-3.5">
							{isCredits ? (
								<>
									<FeatureItem>
										<NumberFlow
											value={emails}
											className="font-medium tabular-nums"
											transformTiming={{ duration: 500, easing: "ease-out" }}
										/>
										emails, valid until {formatDate(validUntil)}
									</FeatureItem>
									<FeatureItem>
										<span className="font-medium tabular-nums">
											{payg.monthlyEmails.toLocaleString()}
										</span>
										free emails per month on top
									</FeatureItem>
									<FeatureItem>No daily sending limit</FeatureItem>
									<FeatureItem>
										<span className="font-medium tabular-nums">
											{payg.maxAgentInboxes}
										</span>
										inboxes
									</FeatureItem>
									<FeatureItem>
										<span className="font-medium tabular-nums">
											{payg.maxWebhooks}
										</span>
										webhooks
									</FeatureItem>
									<FeatureItem>
										<span className="font-medium tabular-nums">
											{payg.maxCustomDomains}
										</span>
										custom domains
									</FeatureItem>
									<FeatureItem>
										<span className="font-medium tabular-nums">
											{Math.round(payg.maxAttachmentBytes / (1024 * 1024))}
										</span>
										MB attachments
									</FeatureItem>
									<FeatureItem>
										{formatUsd(creditPackPriceCents(1000))} per 1,000 emails, no
										subscription
									</FeatureItem>
								</>
							) : isEnterprise ? (
								selectedPlan.features.map((feature) => (
									<FeatureItem key={feature}>{feature}</FeatureItem>
								))
							) : (
								<>
									{NUMERIC_FEATURES.map((row) => (
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
									))}
									<FeatureItem>
										{selectedPlan.comparison.support} support
									</FeatureItem>
								</>
							)}
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
						<p className="text-paragraph-xs text-text-sub-600">
							{isCredits ? "One-time payment" : "Plan"}
						</p>
						<p className="font-medium text-label-sm text-text-strong-950 tabular-nums">
							{isCredits ? (
								<NumberFlow
									value={priceCents / 100}
									locales="en-US"
									format={{
										style: "currency",
										currency: "USD",
										minimumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
										maximumFractionDigits: 2,
									}}
								/>
							) : (
								selectedPlan.name
							)}
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
							variant="neutral"
							size="small"
							className="font-medium"
							disabled={pending || (!isCredits && selectedId === currentPlanId)}
							onClick={() =>
								isCredits ? creditsCheckout.mutate(emails) : handleSwitch()
							}
						>
							{pending
								? "Redirecting…"
								: isCredits
									? "Buy credits"
									: isEnterprise
										? "Contact sales"
										: "Switch plan"}
						</FancyButton.Root>
					</div>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
}
