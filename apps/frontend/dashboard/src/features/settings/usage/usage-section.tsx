import NumberFlow from "@number-flow/react";
import {
	defaultPlan,
	getNextPlan,
	getPlanById,
	type PlanId,
	pricingPlans,
} from "@reloop/pricing";
import * as FancyButton from "@reloop/ui/fancy-button";
import { cn } from "@reloop/ui/cn";
import { Circle } from "rc-progress";
import { useState } from "react";
import { SwitchPlanModal } from "#/features/settings/billing/switch-plan-modal";
import { useBillingUsage } from "#/features/settings/billing/use-billing-usage";

type UsageStatus = "healthy" | "warning" | "critical" | "unlimited";

function statusFromRatio(ratio: number, isUnlimited = false): UsageStatus {
	if (isUnlimited) return "unlimited";
	if (ratio >= 1) return "critical";
	if (ratio >= 0.8) return "warning";
	return "healthy";
}

const STROKE_COLOR: Record<UsageStatus, string> = {
	healthy: "var(--success-base)",
	warning: "var(--warning-base)",
	critical: "var(--error-base)",
	unlimited: "var(--text-soft-400)",
};

function RingMeter({ ratio, status }: { ratio: number; status: UsageStatus }) {
	const percent = status === "unlimited" ? 0 : Math.min(100, ratio * 100);
	return (
		<Circle
			className="h-5 w-5 shrink-0"
			percent={percent}
			strokeWidth={14}
			trailWidth={14}
			strokeLinecap="round"
			strokeColor={STROKE_COLOR[status]}
			trailColor="var(--bg-soft-200)"
		/>
	);
}

function UsageRow({
	label,
	used,
	total,
	unit,
	isUnlimited,
	isLast,
}: {
	label: string;
	used: number;
	total: number;
	unit?: string;
	isUnlimited?: boolean;
	isLast?: boolean;
}) {
	const ratio = isUnlimited || total === 0 ? 0 : used / total;
	const status = statusFromRatio(ratio, isUnlimited);

	return (
		<div
			className={cn(
				"flex items-center gap-4 py-3.5",
				!isLast &&
					"border-stroke-soft-100 border-b dark:border-stroke-soft-100/40",
			)}
		>
			<RingMeter ratio={ratio} status={status} />
			<div className="flex min-w-0 flex-1 items-center justify-between gap-3">
				<span className="truncate font-medium text-paragraph-sm text-text-sub-600">
					{label}
				</span>
				<span
					className={cn(
						"shrink-0 font-medium text-paragraph-xs tabular-nums",
						isUnlimited ? "text-text-soft-400" : "text-text-strong-950",
					)}
				>
					{isUnlimited ? (
						"Unlimited"
					) : (
						<>
							<NumberFlow value={used} className="tabular-nums" />
							{" / "}
							{total.toLocaleString()}
							{unit ? (
								<span className="ml-1 font-normal text-paragraph-xs text-text-soft-400">
									{unit}
								</span>
							) : null}
						</>
					)}
				</span>
			</div>
		</div>
	);
}

function SpecRow({
	label,
	value,
	isLast,
}: {
	label: string;
	value: string;
	isLast?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-4 py-3.5",
				!isLast &&
					"border-stroke-soft-100 border-b dark:border-stroke-soft-100/40",
			)}
		>
			<div className="flex h-5 w-5 shrink-0 items-center justify-center">
				<div className="h-1.5 w-1.5 rounded-full bg-stroke-soft-200 dark:bg-white/20" />
			</div>
			<div className="flex min-w-0 flex-1 items-center justify-between gap-3">
				<span className="truncate font-medium text-paragraph-sm text-text-sub-600">
					{label}
				</span>
				<span className="inline-flex h-5 shrink-0 items-center rounded-full bg-bg-weak-50 px-2.5 font-medium text-label-xs text-text-sub-600 dark:bg-white/[0.06]">
					{value}
				</span>
			</div>
		</div>
	);
}

function CategoryCard({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-stroke-soft-100 sm:grid-cols-[200px_1fr] dark:border-stroke-soft-100/40">
			<div className="flex flex-col border-stroke-soft-100 border-b bg-bg-weak-50/30 p-5 sm:border-r sm:border-b-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
				<h2 className="font-semibold text-label-md text-text-strong-950">
					{title}
				</h2>
				<p className="mt-1 text-paragraph-xs text-text-sub-600 leading-relaxed">
					{description}
				</p>
			</div>

			<div className="divide-y divide-stroke-soft-100 bg-bg-white-0 px-5 dark:divide-stroke-soft-100/40 dark:bg-white/[0.01]">
				{children}
			</div>
		</div>
	);
}

function UpgradeBanner({
	planName,
	nextPlanName,
	onUpgrade,
}: {
	planName: string;
	nextPlanName: string;
	onUpgrade: () => void;
}) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
			<div className="min-w-0">
				<p className="font-medium text-paragraph-sm text-text-strong-950">
					You&apos;re on the{" "}
					<span className="text-text-strong-950">{planName} plan</span>
				</p>
				<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
					Upgrade to {nextPlanName} for higher limits on emails, inboxes, and
					more.
				</p>
			</div>
			<FancyButton.Root
				variant="blue"
				size="xsmall"
				className="shrink-0 rounded-full font-medium"
				onClick={onUpgrade}
			>
				Upgrade plan
			</FancyButton.Root>
		</div>
	);
}

function SkeletonCard() {
	return (
		<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 sm:grid sm:grid-cols-[200px_1fr] dark:border-stroke-soft-100/40">
			<div className="bg-bg-weak-50/30 p-5 dark:bg-white/[0.02]">
				<div className="h-4 w-24 animate-pulse rounded bg-bg-weak-50 dark:bg-white/5" />
				<div className="mt-2 h-3 w-36 animate-pulse rounded bg-bg-weak-50 dark:bg-white/5" />
			</div>
			<div className="space-y-0 bg-bg-white-0 px-5 dark:bg-white/[0.01]">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="flex items-center gap-4 border-stroke-soft-100 border-b py-3.5 last:border-0 dark:border-stroke-soft-100/40"
					>
						<div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-bg-weak-50 dark:bg-white/5" />
						<div className="h-3 flex-1 animate-pulse rounded bg-bg-weak-50 dark:bg-white/5" />
						<div className="h-3 w-16 animate-pulse rounded bg-bg-weak-50 dark:bg-white/5" />
					</div>
				))}
			</div>
		</div>
	);
}

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

function parseCount(val: string): number {
	if (val === "Custom") return 0;
	return Number.parseInt(val.replace(/\D/g, ""), 10) || 0;
}

export function UsageSection() {
	const { data, isLoading } = useBillingUsage();
	const [switchOpen, setSwitchOpen] = useState(false);

	if (isLoading || !data) {
		return (
			<div className="space-y-4">
				<div className="h-16 animate-pulse rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]" />
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

	const resetDays = daysUntil(subscription.currentPeriodEnd);
	const periodRange = `${formatDate(subscription.currentPeriodStart)} – ${formatDate(
		subscription.currentPeriodEnd,
	)}`;

	const currentPlanId = resolvePlanId(plan.name);
	const currentPlan = getPlanById(currentPlanId) ?? defaultPlan;
	const nextPlan = getNextPlan(currentPlanId);

	return (
		<div className="space-y-4">
			{nextPlan && (
				<UpgradeBanner
					planName={currentPlan.name}
					nextPlanName={nextPlan.name}
					onUpgrade={() => setSwitchOpen(true)}
				/>
			)}

			<CategoryCard
				title="Emails"
				description="Transactional & campaign emails sent through Reloop."
			>
				<div className="border-stroke-soft-100 border-b py-3.5 dark:border-stroke-soft-100/40">
					<div className="mb-2 flex items-center justify-between">
						<span className="font-medium text-paragraph-sm text-text-sub-600">
							Monthly emails
						</span>
						<span className="text-paragraph-xs text-text-soft-400">
							{periodRange} · Resets in {resetDays}d
						</span>
					</div>

					<div className="mb-3 flex items-end justify-between gap-3">
						<p className="flex items-baseline gap-1.5">
							<span className="font-semibold text-text-strong-950 text-title-h5 tabular-nums">
								<NumberFlow value={used} />
							</span>
							<span className="text-paragraph-sm text-text-sub-600">
								/ {total.toLocaleString()}
							</span>
						</p>
						<span className="text-paragraph-xs text-text-soft-400 tabular-nums">
							{percent}% used
						</span>
					</div>

					{(() => {
						const sent = subscription.creditsSent ?? used;
						const received = subscription.creditsReceived ?? 0;
						const sentPct = total > 0 ? Math.min(100, (sent / total) * 100) : 0;
						const recvPct =
							total > 0 ? Math.min(100 - sentPct, (received / total) * 100) : 0;
						return (
							<>
								<div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-soft-200 dark:bg-white/10">
									<div
										className="absolute top-0 left-0 h-full rounded-l-full bg-information-base transition-all duration-500"
										style={{ width: `${Math.max(sentPct, sent > 0 ? 1 : 0)}%` }}
									/>
									<div
										className="absolute top-0 h-full bg-purple-500 transition-all duration-500"
										style={{
											left: `${Math.max(sentPct, sent > 0 ? 1 : 0)}%`,
											width: `${Math.max(recvPct, received > 0 ? 1 : 0)}%`,
											borderRadius:
												recvPct > 0 ? "0 9999px 9999px 0" : undefined,
										}}
									/>
								</div>

								<div className="mt-2.5 flex items-center justify-between gap-4">
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-1.5">
											<span className="h-2 w-2 shrink-0 rounded-full bg-information-base" />
											<span className="font-medium text-paragraph-xs text-text-sub-600">
												Sent
											</span>
											<span className="font-medium text-paragraph-xs text-text-strong-950 tabular-nums">
												<NumberFlow value={sent} />
											</span>
										</div>
										<div className="flex items-center gap-1.5">
											<span className="h-2 w-2 shrink-0 rounded-full bg-purple-500" />
											<span className="font-medium text-paragraph-xs text-text-sub-600">
												Received
											</span>
											<span className="font-medium text-paragraph-xs text-text-strong-950 tabular-nums">
												<NumberFlow value={received} />
											</span>
										</div>
									</div>
									<span className="text-paragraph-xs text-text-soft-400 tabular-nums">
										<NumberFlow value={remaining} /> remaining
									</span>
								</div>
							</>
						);
					})()}
				</div>

				<SpecRow
					label="Send rate"
					value={`${plan.ratePerSecond} / sec`}
					isLast={false}
				/>
				<SpecRow
					label="Max attachment size"
					value={`${plan.maxAttachmentSizeMb} MB`}
					isLast={true}
				/>
			</CategoryCard>

			<CategoryCard
				title="AI Agent Inbox"
				description="Inboxes for AI agents and humans to receive and route email."
			>
				<UsageRow
					label="Agent inboxes"
					used={0}
					total={parseCount(currentPlan.comparison.agentInbox)}
					isUnlimited={currentPlan.comparison.agentInbox === "Custom"}
					isLast={true}
				/>
			</CategoryCard>

			<CategoryCard
				title="Other Limits"
				description="Additional plan limits for domains, email verification, and dedicated IPs."
			>
				<UsageRow
					label="Webhooks"
					used={0}
					total={parseCount(currentPlan.comparison.webhooks)}
					isUnlimited={currentPlan.comparison.webhooks === "Custom"}
					isLast={false}
				/>
				<UsageRow
					label="Custom domains"
					used={0}
					total={parseCount(currentPlan.comparison.customDomains)}
					isUnlimited={currentPlan.comparison.customDomains === "Custom"}
					isLast={false}
				/>
				<UsageRow
					label="Email validation"
					used={0}
					total={parseCount(currentPlan.comparison.emailValidation)}
					unit="/ mo"
					isUnlimited={currentPlan.comparison.emailValidation === "Custom"}
					isLast={false}
				/>
				<SpecRow
					label="Dedicated IP"
					value={
						currentPlan.comparison.dedicatedIp === "—" ||
						currentPlan.comparison.dedicatedIp === ""
							? "Not included"
							: currentPlan.comparison.dedicatedIp
					}
					isLast={true}
				/>
			</CategoryCard>

			<SwitchPlanModal
				open={switchOpen}
				onOpenChange={setSwitchOpen}
				currentPlanId={currentPlanId}
			/>
		</div>
	);
}
