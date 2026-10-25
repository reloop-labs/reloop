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
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
	parseAsInteger,
	parseAsStringLiteral,
	useQueryState,
	useQueryStates,
} from "nuqs";
import { useCallback, useRef, useState } from "react";
import { StepSlider } from "./step-slider";
import {
	contactEnterprise,
	useBillingCheckout,
	useCreditsCheckout,
} from "./use-billing-actions";

export type BillingMode = "monthly" | "credits";

export const BILLING_MODES: Array<{
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
		description: `One-time payment. Credits last ${creditPack.validityMonths} months.`,
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

const LABELLED_PACKS = new Set<number>([
	3_000, 10_000, 30_000, 50_000, 100_000,
]);

export function CreditPackSlider({
	emails,
	onChange,
}: {
	emails: number;
	onChange: (emails: number) => void;
}) {
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
				<StepSlider
					steps={creditPackSizes}
					value={emails}
					onChange={onChange}
					ariaLabel="Number of emails"
					labelled={(size) => LABELLED_PACKS.has(size)}
				/>
			</div>
		</div>
	);
}

/** Same tab strip as the Contacts page: underline plus a hover pill. */
function BillingModeTabs({
	value,
	onChange,
}: {
	value: BillingMode;
	onChange: (mode: BillingMode) => void;
}) {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const activeIndex = BILLING_MODES.findIndex((option) => option.id === value);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();
	const parentRect = tab?.offsetParent?.getBoundingClientRect();

	return (
		<TabMenuHorizontal.Root
			value={value}
			onValueChange={(next) => onChange(next as BillingMode)}
		>
			<TabMenuHorizontal.List
				aria-label="Billing mode"
				className="relative h-11 w-full gap-0 border-b! px-2 py-0"
			>
				{BILLING_MODES.map((option, index) => (
					<TabMenuHorizontal.Trigger
						key={option.id}
						value={option.id}
						ref={(el) => {
							if (el) buttonRefs.current[index] = el;
						}}
						onPointerEnter={() => setHoveredIdx(index)}
						onPointerLeave={() => setHoveredIdx(undefined)}
						className={cn(
							"flex shrink-0 cursor-pointer items-center px-3 py-0! font-medium text-sm",
							hoveredIdx === undefined &&
								activeIndex === index &&
								"text-text-strong-950",
						)}
					>
						{option.label}
					</TabMenuHorizontal.Trigger>
				))}
				<AnimatePresence>
					{rect && activeIndex !== -1 ? (
						<motion.div
							className="absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
							initial={{
								pointerEvents: "none",
								width: rect.width,
								height: rect.height - 14,
								left: rect.left - (parentRect?.left || 0),
								top: rect.top - (parentRect?.top || 0) + 7,
								opacity: 0,
							}}
							animate={{
								pointerEvents: "none",
								width: rect.width,
								height: rect.height - 14,
								left: rect.left - (parentRect?.left || 0),
								top: rect.top - (parentRect?.top || 0) + 7,
								opacity: 1,
							}}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.14 }}
						/>
					) : null}
				</AnimatePresence>
			</TabMenuHorizontal.List>
		</TabMenuHorizontal.Root>
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

const BILLING_MODE_IDS = ["monthly", "credits"] as const;
const PLAN_IDS = pricingPlans.map((plan) => plan.id);

/**
 * Modal state lives in the URL (`?switchPlan=credits&plan=…&emails=…`) so a
 * reload reopens it on the same tab, plan and pack instead of losing it.
 */
const switchPlanParsers = {
	switchPlan: parseAsStringLiteral(BILLING_MODE_IDS),
	plan: parseAsStringLiteral(PLAN_IDS),
	emails: parseAsInteger,
};

/** Tab the modal opens on: Pay as you go for credit users, Monthly otherwise. */
export function defaultBillingMode(currentPlanId: PlanId): BillingMode {
	return currentPlanId === "payg" ? "credits" : "monthly";
}

/** Opens the Switch plan modal (rendered elsewhere on the page) on a tab. */
export function useOpenSwitchPlanModal() {
	const [, setMode] = useQueryState("switchPlan", switchPlanParsers.switchPlan);
	return useCallback((mode: BillingMode) => void setMode(mode), [setMode]);
}

interface SwitchPlanModalProps {
	currentPlanId: PlanId;
	/** Expiry of credits the org already holds, if any. */
	creditsExpireAt?: string | null;
}

export function SwitchPlanModal({
	currentPlanId,
	creditsExpireAt,
}: SwitchPlanModalProps) {
	const router = useRouter();
	const [query, setQuery] = useQueryStates(switchPlanParsers);
	const open = query.switchPlan !== null;
	const mode: BillingMode =
		query.switchPlan ?? defaultBillingMode(currentPlanId);
	const selectedId: PlanId = query.plan ?? currentPlanId;
	const emails =
		query.emails !== null &&
		(creditPackSizes as readonly number[]).includes(query.emails)
			? query.emails
			: DEFAULT_PACK;

	const setMode = (next: BillingMode) => void setQuery({ switchPlan: next });
	const setSelectedId = (next: PlanId) => void setQuery({ plan: next });
	const setEmails = (next: number) => void setQuery({ emails: next });
	const onOpenChange = (next: boolean) => {
		if (!next) void setQuery({ switchPlan: null, plan: null, emails: null });
	};

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

	// No onOpenChange(false) here: nuqs flushes its query update after the push
	// and would replace the URL back to this page. The plans URL has no
	// switchPlan param, so the modal is closed on arrival anyway.
	const goToPlans = () => {
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
								<X className="h-4 w-4" strokeWidth={2.25} />
							</button>
						</Modal.Close>
					</div>
				</div>

				<BillingModeTabs value={mode} onChange={setMode} />

				<div className="p-5">
					<p className="text-paragraph-sm text-text-sub-600">
						{BILLING_MODES.find((option) => option.id === mode)?.description}
					</p>
					<div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-[300px_1fr]">
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
											{formatUsd(creditPackPriceCents(1000))} per 1,000 emails,
											no subscription
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
