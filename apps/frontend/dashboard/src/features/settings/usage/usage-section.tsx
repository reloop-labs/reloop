import NumberFlow from "@number-flow/react";
import {
	getPlanById,
	isPlanId,
	paidOverageUsdPerThousand,
} from "@reloop/pricing";
import { cn } from "@reloop/ui/cn";
import Link from "next/link";
import { Circle } from "rc-progress";
import { GrantedPlanBanner } from "#/features/settings/billing/granted-plan-banner";
import {
	emailUsage,
	useBillingUsage,
} from "#/features/settings/billing/use-billing-usage";

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
	noLimit,
	isLast,
}: {
	label: string;
	used: number;
	total: number;
	unit?: string;
	isUnlimited?: boolean;
	/** No cap on this plan: show the count, then "Unlimited". */
	noLimit?: boolean;
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
					{noLimit ? (
						<>
							<NumberFlow value={used} className="tabular-nums" />
							<span className="font-normal text-text-soft-400">
								{" / "}Unlimited
							</span>
						</>
					) : isUnlimited ? (
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
	href,
	isLast,
}: {
	label: string;
	value: string;
	href?: string;
	isLast?: boolean;
}) {
	const valueEl = (
		<span className="inline-flex h-5 shrink-0 items-center rounded-full bg-bg-weak-50 px-2.5 font-medium text-label-xs text-text-sub-600 transition-colors dark:bg-white/[0.06]">
			{value}
		</span>
	);

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
				{href ? (
					<Link
						href={href}
						className="rounded-full hover:bg-bg-weak-50 dark:hover:bg-white/[0.08]"
					>
						{valueEl}
					</Link>
				) : (
					valueEl
				)}
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

export function UsageSection() {
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

	const { plan, subscription, resources, daily } = data;
	const unlimited = data.selfHosted;
	const entitlements = plan.entitlements;
	const total = Math.max(0, entitlements?.monthlyEmails ?? plan.monthlyCredits);
	const { sent, received, used, remaining } = emailUsage(subscription);
	const ratio = total > 0 ? used / total : 0;
	const percent = Math.min(100, Math.round(ratio * 100));
	const overageEnabled =
		entitlements?.overageEnabled ?? plan.overageLimit !== 0;
	const prepaidBalance = data.prepaid?.balance ?? 0;
	const prepaidExpiresAt = data.prepaid?.expiresAt ?? null;

	const resetDays = daysUntil(subscription.currentPeriodEnd);
	const periodRange = `${formatDate(subscription.currentPeriodStart)} – ${formatDate(
		subscription.currentPeriodEnd,
	)}`;

	const attachmentMb =
		entitlements != null
			? Math.round(entitlements.maxAttachmentBytes / (1024 * 1024))
			: plan.maxAttachmentSizeMb;
	const dedicatedIpCount = entitlements?.dedicatedIpCount ?? 0;
	const inboxUsed = resources?.agentInboxes.used ?? 0;
	const inboxLimit =
		resources?.agentInboxes.limit ?? entitlements?.maxAgentInboxes ?? 0;
	const webhookUsed = resources?.webhooks.used ?? 0;
	const webhookLimit =
		resources?.webhooks.limit ?? entitlements?.maxWebhooks ?? 0;
	const domainUsed = resources?.customDomains.used ?? 0;
	const domainLimit =
		resources?.customDomains.limit ?? entitlements?.maxCustomDomains ?? 0;
	const smtpUsed = resources?.smtpProviders?.used ?? 0;
	const smtpLimit =
		resources?.smtpProviders?.limit ?? entitlements?.maxSmtpProviders ?? 0;
	const contactsUsed = resources?.contacts?.used ?? 0;
	const membersUsed = resources?.teamMembers?.used ?? 0;
	// Pay as you go carries Pro's limits, support included.
	const planId = plan.id === "payg" ? "individual" : plan.id;
	const supportLevel =
		planId && isPlanId(planId)
			? getPlanById(planId)?.comparison.support
			: undefined;

	return (
		<div className="space-y-4">
			{data.grantedPlan ? (
				<GrantedPlanBanner
					planName={data.grantedPlan.name}
					grantedAt={data.grantedPlan.grantedAt}
				/>
			) : null}

			<CategoryCard
				title="Emails"
				description="Emails sent and received through Reloop. Both count toward your plan."
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
							{unlimited ? null : (
								<span className="text-paragraph-sm text-text-sub-600">
									/ {total.toLocaleString()}
								</span>
							)}
						</p>
						{unlimited ? null : (
							<span className="text-paragraph-xs text-text-soft-400 tabular-nums">
								{percent}% used
							</span>
						)}
					</div>

					{(() => {
						const sentPct = total > 0 ? Math.min(100, (sent / total) * 100) : 0;
						const recvPct =
							total > 0 ? Math.min(100 - sentPct, (received / total) * 100) : 0;
						return (
							<>
								{unlimited ? null : (
									<div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-soft-200 dark:bg-white/10">
										<div
											className="absolute top-0 left-0 h-full rounded-l-full bg-information-base transition-all duration-500"
											style={{
												width: `${Math.max(sentPct, sent > 0 ? 1 : 0)}%`,
											}}
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
								)}

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
									{unlimited ? null : (
										<span className="text-paragraph-xs text-text-soft-400 tabular-nums">
											<NumberFlow value={remaining} /> remaining
										</span>
									)}
								</div>
							</>
						);
					})()}
				</div>

				{daily?.limit != null ? (
					<UsageRow
						label="Daily emails"
						used={daily.sent}
						total={daily.limit}
						isLast={false}
					/>
				) : null}

				{!unlimited && (prepaidBalance > 0 || prepaidExpiresAt) ? (
					<SpecRow
						label="Email credits"
						value={`${prepaidBalance.toLocaleString()} left${
							prepaidExpiresAt
								? ` · valid until ${formatDate(prepaidExpiresAt)}`
								: ""
						}`}
						isLast={false}
					/>
				) : null}

				{unlimited ? null : (
					<SpecRow
						label="Overage"
						value={
							prepaidBalance > 0
								? "Credits are used after the monthly limit"
								: overageEnabled
									? `$${paidOverageUsdPerThousand.toFixed(2)} / 1,000 emails`
									: "Sending pauses at the limit"
						}
						isLast={false}
					/>
				)}
				<SpecRow
					label="Max attachment size"
					value={`${attachmentMb} MB`}
					isLast={true}
				/>
			</CategoryCard>

			<CategoryCard
				title="Inbox"
				description="Inboxes to receive and route email."
			>
				<UsageRow
					label="Inboxes"
					used={inboxUsed}
					total={inboxLimit}
					isUnlimited={unlimited}
					isLast={true}
				/>
			</CategoryCard>

			<CategoryCard
				title="Contacts & team"
				description="People you email and people who work in Reloop."
			>
				<UsageRow
					label="Contacts"
					used={contactsUsed}
					total={0}
					noLimit
					isLast={false}
				/>
				<UsageRow
					label="Team members"
					used={membersUsed}
					total={0}
					noLimit
					isLast={true}
				/>
			</CategoryCard>

			<CategoryCard
				title="Other Limits"
				description="Webhooks, domains, SMTP servers, dedicated IPs and support on this organization."
			>
				<UsageRow
					label="Webhooks"
					used={webhookUsed}
					total={webhookLimit}
					isUnlimited={unlimited}
					isLast={false}
				/>
				<UsageRow
					label="Custom domains"
					used={domainUsed}
					total={domainLimit}
					isUnlimited={unlimited}
					isLast={false}
				/>
				<UsageRow
					label="Own SMTP servers"
					used={smtpUsed}
					total={smtpLimit}
					isUnlimited={unlimited}
					isLast={unlimited}
				/>
				{unlimited ? null : (
					<>
						<SpecRow
							label="Dedicated IP"
							value={
								dedicatedIpCount > 0
									? `${dedicatedIpCount} included`
									: "Not included"
							}
							href="/settings/dedicated-ip"
							isLast={false}
						/>
						<SpecRow
							label="Data retention"
							value={`${entitlements?.dataRetentionDays ?? 45} days`}
							isLast={!supportLevel}
						/>
						{supportLevel ? (
							<SpecRow label="Support" value={supportLevel} isLast={true} />
						) : null}
					</>
				)}
			</CategoryCard>
		</div>
	);
}
