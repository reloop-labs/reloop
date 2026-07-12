"use client";

import { useBillingUsage } from "@fe/dashboard/hooks/useBillingUsage";
import NumberFlow from "@number-flow/react";
import {
	defaultPlan,
	getPlanById,
	getNextPlan,
	type PlanId,
	pricingPlans,
} from "@reloop/pricing";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type UsageStatus = "healthy" | "warning" | "critical" | "unlimited";

function statusFromRatio(
	ratio: number,
	isUnlimited = false,
): UsageStatus {
	if (isUnlimited) return "unlimited";
	if (ratio >= 1) return "critical";
	if (ratio >= 0.8) return "warning";
	return "healthy";
}

const STATUS_META: Record<
	UsageStatus,
	{ label: string; pill: string; ring: string; track: string; text: string }
> = {
	healthy: {
		label: "Healthy",
		pill: "bg-success-lighter text-success-base dark:bg-success-base/10",
		ring: "text-success-base",
		track: "text-bg-weak-100 dark:text-white/10",
		text: "text-success-base",
	},
	warning: {
		label: "Approaching limit",
		pill: "bg-warning-lighter text-warning-base dark:bg-warning-base/10",
		ring: "text-warning-base",
		track: "text-bg-weak-100 dark:text-white/10",
		text: "text-warning-base",
	},
	critical: {
		label: "Limit reached",
		pill: "bg-error-lighter text-error-base dark:bg-error-base/10",
		ring: "text-error-base",
		track: "text-bg-weak-100 dark:text-white/10",
		text: "text-error-base",
	},
	unlimited: {
		label: "Unlimited",
		pill: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/[0.06]",
		ring: "text-text-soft-400",
		track: "text-bg-weak-100 dark:text-white/10",
		text: "text-text-sub-600",
	},
};

// ─── Ring Meter ───────────────────────────────────────────────────────────────

const RADIUS = 14;
const CIRC = 2 * Math.PI * RADIUS;

function RingMeter({
	ratio,
	status,
}: {
	ratio: number;
	status: UsageStatus;
}) {
	const meta = STATUS_META[status];
	const dashOffset =
		status === "unlimited" ? CIRC : CIRC * (1 - Math.min(1, ratio));

	return (
		<svg width={36} height={36} viewBox="0 0 36 36" className="shrink-0 -rotate-90">
			{/* Track */}
			<circle
				cx={18}
				cy={18}
				r={RADIUS}
				fill="none"
				strokeWidth={3.5}
				className={cn("transition-all", meta.track)}
				stroke="currentColor"
			/>
			{/* Progress */}
			<circle
				cx={18}
				cy={18}
				r={RADIUS}
				fill="none"
				strokeWidth={3.5}
				strokeLinecap="round"
				strokeDasharray={CIRC}
				strokeDashoffset={status === "unlimited" ? CIRC * 0.25 : dashOffset}
				className={cn("transition-all duration-500", meta.ring)}
				stroke="currentColor"
			/>
		</svg>
	);
}

// ─── Usage Row ────────────────────────────────────────────────────────────────

function UsageRow({
	label,
	used,
	total,
	unit,
	isUnlimited,
	isLast,
}: {
	label: string;
	used: number | string;
	total: number | string;
	unit?: string;
	isUnlimited?: boolean;
	isLast?: boolean;
}) {
	const numUsed = typeof used === "number" ? used : 0;
	const numTotal = typeof total === "number" ? total : 0;
	const ratio = isUnlimited || numTotal === 0 ? 0 : numUsed / numTotal;
	const status = statusFromRatio(ratio, isUnlimited);
	const meta = STATUS_META[status];

	const displayValue = isUnlimited
		? "Unlimited"
		: typeof used === "number"
			? `${numUsed.toLocaleString()} / ${numTotal.toLocaleString()}`
			: `${used} / ${total}`;

	return (
		<div
			className={cn(
				"flex items-center gap-4 py-3.5",
				!isLast &&
					"border-stroke-soft-100 border-b dark:border-stroke-soft-100/40",
			)}
		>
			<RingMeter ratio={ratio} status={status} />
			<div className="flex flex-1 items-center justify-between gap-3 min-w-0">
				<span className="text-paragraph-sm text-text-sub-600 truncate">
					{label}
				</span>
				<span
					className={cn(
						"shrink-0 font-medium text-paragraph-sm tabular-nums",
						isUnlimited ? "text-text-soft-400" : "text-text-strong-950",
					)}
				>
					{isUnlimited ? (
						"Unlimited"
					) : typeof used === "number" ? (
						<>
							<NumberFlow value={numUsed} className="tabular-nums" />
							{" / "}
							{numTotal.toLocaleString()}
							{unit ? (
								<span className="ml-1 text-paragraph-xs text-text-soft-400 font-normal">
									{unit}
								</span>
							) : null}
						</>
					) : (
						displayValue
					)}
				</span>
			</div>
			<span
				className={cn(
					"hidden sm:inline-flex h-5 shrink-0 items-center rounded-full px-2 font-medium text-label-xs",
					meta.pill,
				)}
			>
				{meta.label}
			</span>
		</div>
	);
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
	icon,
	title,
	description,
	planName,
	onUpgrade,
	showUpgrade,
	children,
}: {
	icon: string;
	title: string;
	description: string;
	planName: string;
	onUpgrade?: () => void;
	showUpgrade?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40 sm:grid-cols-[220px_1fr]">
			{/* Left info panel */}
			<div className="flex flex-col justify-between gap-4 border-stroke-soft-100 p-5 dark:border-stroke-soft-100/40 sm:border-r bg-bg-weak-50/30 dark:bg-white/[0.02]">
				<div>

					<h2 className="font-semibold text-label-md text-text-strong-950">
						{title}
					</h2>
					<p className="mt-1 text-paragraph-xs text-text-sub-600 leading-relaxed">
						{description}
					</p>
				</div>
				<div className="space-y-2">
					{showUpgrade && onUpgrade && (
						<div>
							<Button.Root
								variant="neutral"
								mode="filled"
								size="xxsmall"
								className="rounded-full font-medium"
								onClick={onUpgrade}
							>
								Upgrade
							</Button.Root>
						</div>
					)}
				</div>
			</div>

			{/* Right usage panel */}
			<div className="bg-bg-white-0 px-5 dark:bg-white/[0.01] divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
				{children}
			</div>
		</div>
	);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
	return (
		<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40 sm:grid sm:grid-cols-[220px_1fr]">
			<div className="bg-bg-weak-50/30 p-5 dark:bg-white/[0.02]">
				<div className="h-8 w-8 animate-pulse rounded-lg bg-bg-weak-100 dark:bg-white/5 mb-3" />
				<div className="h-4 w-20 animate-pulse rounded bg-bg-weak-100 dark:bg-white/5" />
				<div className="mt-2 h-3 w-32 animate-pulse rounded bg-bg-weak-100 dark:bg-white/5" />
			</div>
			<div className="bg-bg-white-0 p-5 dark:bg-white/[0.01] space-y-4">
				{[0, 1, 2].map((i) => (
					<div key={i} className="flex items-center gap-4">
						<div className="h-9 w-9 animate-pulse rounded-full bg-bg-weak-100 dark:bg-white/5 shrink-0" />
						<div className="flex-1 h-3 animate-pulse rounded bg-bg-weak-100 dark:bg-white/5" />
						<div className="h-3 w-16 animate-pulse rounded bg-bg-weak-100 dark:bg-white/5" />
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function resolvePlanId(name: string | undefined): PlanId {
	const normalized = (name ?? "free").toLowerCase();
	const match = pricingPlans.find((p) => p.id === normalized);
	return match?.id ?? "free";
}

function daysUntil(dateStr: string): number {
	const end = new Date(dateStr).getTime();
	if (Number.isNaN(end)) return 0;
	return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function UsageSection({ onUpgrade }: { onUpgrade?: () => void }) {
	const router = useRouter();
	const { data, isLoading } = useBillingUsage();

	if (isLoading || !data) {
		return (
			<div className="space-y-4">
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
			</div>
		);
	}

	const { plan, subscription } = data;
	const total = Math.max(0, plan.monthlyCredits);
	const used = Math.max(0, subscription.creditsUsed);
	const remaining = Math.max(0, subscription.creditsRemaining);
	const ratio = total > 0 ? used / total : 0;
	const percent = Math.min(100, Math.round(ratio * 100));
	const status = statusFromRatio(ratio);

	const resetDays = daysUntil(subscription.currentPeriodEnd);
	const periodRange = `${formatDate(subscription.currentPeriodStart)} – ${formatDate(
		subscription.currentPeriodEnd,
	)}`;

	const currentPlanId = resolvePlanId(plan.name);
	const currentPlan = getPlanById(currentPlanId) ?? defaultPlan;
	const nextPlan = getNextPlan(currentPlanId);
	const planName = currentPlan.name;
	const showUpgrade = !!nextPlan;

	return (
		<div className="space-y-4">
			{/* ── Sending (Transactional) ───────────────────────────────────── */}
			<CategoryCard
				icon="send"
				title="Emails"
				description="All sending and receiving email through Reloop."
				planName={planName}
				onUpgrade={onUpgrade}
				showUpgrade={showUpgrade && status !== "healthy"}
			>
				{/* Monthly emails hero row */}
				<div className="py-3.5 border-b border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<div className="flex items-center justify-between mb-2">
						<span className="text-paragraph-sm text-text-sub-600">
							Monthly emails
						</span>
						<span className="text-paragraph-xs text-text-soft-400">
							{periodRange} · Resets in {resetDays}d
						</span>
					</div>
					<div className="flex items-end justify-between gap-3 mb-2.5">
						<p className="flex items-baseline gap-1.5">
							<span className="font-semibold text-text-strong-950 text-title-h5 tabular-nums">
								<NumberFlow value={used} />
							</span>
							<span className="text-paragraph-sm text-text-sub-600">
								/ {total.toLocaleString()}
							</span>
						</p>
						<div className="flex items-center gap-2">
							<span className="text-paragraph-xs text-text-soft-400 tabular-nums">
								{percent}% used
							</span>
							<span
								className={cn(
									"inline-flex h-5 items-center rounded-full px-2 font-medium text-label-xs",
									STATUS_META[status].pill,
								)}
							>
								{STATUS_META[status].label}
							</span>
						</div>
					</div>
					{/* Progress bar */}
					<div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-weak-100 dark:bg-white/10">
						<div
							className={cn(
								"h-full rounded-full transition-all duration-500",
								STATUS_META[status].ring.replace("text-", "bg-"),
							)}
							style={{ width: `${Math.max(percent, ratio > 0 ? 1 : 0)}%` }}
						/>
					</div>
					<div className="mt-1.5 text-paragraph-xs text-text-soft-400 text-right">
						<NumberFlow value={remaining} className="tabular-nums" /> remaining
					</div>
				</div>

				<UsageRow
					label="Send rate"
					used={plan.ratePerSecond}
					total={plan.ratePerSecond}
					unit="/ sec"
					isUnlimited={false}
					isLast={false}
				/>
				<UsageRow
					label="Max attachment size"
					used={plan.maxAttachmentSizeMb}
					total={plan.maxAttachmentSizeMb}
					unit="MB"
					isUnlimited={false}
					isLast={true}
				/>
			</CategoryCard>

			{/* ── Deliverability ────────────────────────────────────────────── */}
			<CategoryCard
				icon="shield-check"
				title="Deliverability"
				description="Custom domains and email validation for better inbox placement."
				planName={planName}
				onUpgrade={onUpgrade}
				showUpgrade={showUpgrade}
			>
				<UsageRow
					label="Custom domains"
					used={0}
					total={
						currentPlan.comparison.customDomains === "Custom"
							? 0
							: parseInt(
									currentPlan.comparison.customDomains.replace(/\D/g, ""),
									10,
								) || 0
					}
					isUnlimited={currentPlan.comparison.customDomains === "Custom"}
					isLast={false}
				/>
				<UsageRow
					label="Email validation"
					used={0}
					total={
						currentPlan.comparison.emailValidation === "Custom"
							? 0
							: parseInt(
									currentPlan.comparison.emailValidation.replace(/\D/g, ""),
									10,
								) || 0
					}
					unit="/ mo"
					isUnlimited={currentPlan.comparison.emailValidation === "Custom"}
					isLast={false}
				/>
				<UsageRow
					label="Dedicated IP"
					used={0}
					total={0}
					isUnlimited={
						currentPlan.comparison.dedicatedIp !== "—" &&
						currentPlan.comparison.dedicatedIp !== ""
					}
					isLast={true}
				/>
			</CategoryCard>

			{/* ── Inbound & Routing ─────────────────────────────────────────── */}
			<CategoryCard
				icon="inbox"
				title="Inbound & routing"
				description="Agent inboxes and webhooks for receiving and routing email."
				planName={planName}
				onUpgrade={onUpgrade}
				showUpgrade={showUpgrade}
			>
				<UsageRow
					label="Agent inboxes"
					used={0}
					total={
						currentPlan.comparison.agentInbox === "Custom"
							? 0
							: parseInt(
									currentPlan.comparison.agentInbox.replace(/\D/g, ""),
									10,
								) || 0
					}
					isUnlimited={currentPlan.comparison.agentInbox === "Custom"}
					isLast={false}
				/>
				<UsageRow
					label="Webhooks"
					used={0}
					total={
						currentPlan.comparison.webhooks === "Custom"
							? 0
							: parseInt(
									currentPlan.comparison.webhooks.replace(/\D/g, ""),
									10,
								) || 0
					}
					isUnlimited={currentPlan.comparison.webhooks === "Custom"}
					isLast={true}
				/>
			</CategoryCard>

			{/* ── Overage notice ────────────────────────────────────────────── */}
			{status !== "healthy" && onUpgrade && (
				<div className="flex items-center justify-between gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-lighter dark:bg-warning-base/10">
							<Icon
								name="triangle-alert"
								className="h-4 w-4 text-warning-base"
							/>
						</div>
						<p className="text-paragraph-sm text-text-sub-600">
							{status === "critical"
								? "You've reached your monthly email limit. Upgrade to keep sending."
								: "You're approaching your monthly email limit."}
						</p>
					</div>
					<Button.Root
						variant="neutral"
						mode="filled"
						size="xxsmall"
						className="shrink-0 rounded-full font-medium"
						onClick={onUpgrade}
					>
						Upgrade
					</Button.Root>
				</div>
			)}
		</div>
	);
}
