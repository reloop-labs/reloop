"use client";

import { getNextPlan, isCheckoutPlanId } from "@reloop/pricing";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { SETTINGS_MEMBER_HOME } from "#/features/dashboard/navigation";
import { resolvePlanId } from "#/features/settings/billing/plan-id";
import {
	contactEnterprise,
	useBillingCheckout,
} from "#/features/settings/billing/use-billing-actions";
import { useBillingUsage } from "#/features/settings/billing/use-billing-usage";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import {
	type MailboxProvider,
	type OrganizationSendingIp,
	type SendingIpWarmup,
	useSendingIps,
} from "./use-sending-ips";

const CARD =
	"rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.01]";

const WARMUP_DAYS = 42;

const PROVIDER_LABEL: Record<MailboxProvider, string> = {
	gmail: "Gmail",
	microsoft: "Microsoft",
	yahoo: "Yahoo",
	apple: "Apple",
	other: "Other",
};

function CopyValue({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);

	const onCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			// ignore
		}
	}, [value]);

	return (
		<button
			type="button"
			onClick={() => void onCopy()}
			className="group inline-flex max-w-full items-center gap-1.5 rounded-md text-left transition-colors hover:text-text-strong-950"
		>
			<span className="truncate font-medium font-mono text-paragraph-sm text-text-strong-950 tabular-nums">
				{value}
			</span>
			<Icon
				name={copied ? "check" : "copy"}
				className="h-3.5 w-3.5 shrink-0 text-text-soft-400 transition-colors group-hover:text-text-sub-600"
			/>
		</button>
	);
}

function StatusPill({
	tone,
	children,
}: {
	tone: "info" | "success" | "warning" | "neutral";
	children: ReactNode;
}) {
	return (
		<span
			className={cn(
				"inline-flex h-5 shrink-0 items-center rounded-full px-2.5 font-medium text-label-xs",
				tone === "info" && "bg-information-lighter text-information-base",
				tone === "success" && "bg-success-lighter text-success-base",
				tone === "warning" && "bg-warning-lighter text-warning-base",
				tone === "neutral" &&
					"bg-bg-weak-50 text-text-sub-600 dark:bg-white/[0.06]",
			)}
		>
			{children}
		</span>
	);
}

function warmupLabel(warmup: SendingIpWarmup | null): {
	tone: "info" | "success" | "warning" | "neutral";
	text: string;
} {
	if (!warmup) return { tone: "neutral", text: "Assigned" };
	if (warmup.status === "completed") return { tone: "success", text: "Warmed" };
	if (warmup.status === "paused")
		return { tone: "warning", text: "Warmup paused" };
	if (warmup.status === "pending")
		return { tone: "neutral", text: "Warmup scheduled" };
	const day = Math.min(Math.max(warmup.day, 1), WARMUP_DAYS);
	return { tone: "info", text: `Warming · day ${day} of ${WARMUP_DAYS}` };
}

function ProviderBar({
	label,
	sentToday,
	dailyCap,
	complete,
}: {
	label: string;
	sentToday: number;
	dailyCap: number | null;
	complete: boolean;
}) {
	const ratio =
		complete || dailyCap == null || dailyCap <= 0
			? complete
				? 1
				: 0
			: Math.min(1, sentToday / dailyCap);
	const percent = Math.round(ratio * 100);

	return (
		<div className="flex flex-col gap-1.5 py-3">
			<div className="flex items-center justify-between gap-3">
				<span className="font-medium text-paragraph-sm text-text-sub-600">
					{label}
				</span>
				<span className="font-medium text-paragraph-xs text-text-strong-950 tabular-nums">
					{complete || dailyCap == null ? (
						"No daily cap"
					) : (
						<>
							{sentToday.toLocaleString()}
							<span className="font-normal text-text-soft-400">
								{" "}
								/ {dailyCap.toLocaleString()}
							</span>
						</>
					)}
				</span>
			</div>
			<div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-soft-200 dark:bg-white/10">
				<div
					className={cn(
						"h-full rounded-full transition-[width] duration-200 ease-out motion-reduce:transition-none",
						complete ? "bg-success-base" : "bg-information-base",
					)}
					style={{
						width: `${complete ? 100 : Math.max(percent, sentToday > 0 ? 4 : 0)}%`,
					}}
				/>
			</div>
		</div>
	);
}

function IpCard({ ip }: { ip: OrganizationSendingIp }) {
	const status = warmupLabel(ip.warmup);
	const complete = ip.warmup?.status === "completed";
	const day = ip.warmup ? Math.min(Math.max(ip.warmup.day, 1), WARMUP_DAYS) : 0;
	const week = complete ? 6 : Math.min(6, Math.max(1, Math.ceil(day / 7)));

	return (
		<div className={cn(CARD, "overflow-hidden")}>
			<div className="flex flex-col gap-3 border-stroke-soft-100 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between dark:border-stroke-soft-100/40">
				<div className="min-w-0 space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<CopyValue value={ip.address} />
						{ip.isPrimary ? (
							<StatusPill tone="neutral">Primary</StatusPill>
						) : null}
					</div>
					<p className="truncate text-paragraph-xs text-text-soft-400">
						{ip.hostname}
					</p>
				</div>
				<StatusPill tone={status.tone}>{status.text}</StatusPill>
			</div>

			{ip.warmup && ip.warmup.status !== "completed" ? (
				<div className="border-stroke-soft-100 border-b px-5 py-3.5 dark:border-stroke-soft-100/40">
					<div className="mb-2 flex items-center justify-between gap-3">
						<span className="font-medium text-paragraph-sm text-text-sub-600">
							Schedule
						</span>
						<span className="text-paragraph-xs text-text-soft-400">
							Week {week} of 6
						</span>
					</div>
					<div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-soft-200 dark:bg-white/10">
						<div
							className="h-full rounded-full bg-text-strong-950 transition-[width] duration-200 ease-out motion-reduce:transition-none"
							style={{ width: `${Math.max((day / WARMUP_DAYS) * 100, 4)}%` }}
						/>
					</div>
					{ip.warmup.overflow === "shared" ? (
						<p className="mt-2.5 text-paragraph-xs text-text-soft-400">
							Volume past a provider's daily cap uses the shared pool so sending
							is not blocked.
						</p>
					) : (
						<p className="mt-2.5 text-paragraph-xs text-text-soft-400">
							Volume past a provider's daily cap waits until tomorrow.
						</p>
					)}
				</div>
			) : null}

			<div className="divide-y divide-stroke-soft-100 px-5 dark:divide-stroke-soft-100/40">
				{(ip.warmup?.providers ?? []).map((provider) => (
					<ProviderBar
						key={provider.provider}
						label={PROVIDER_LABEL[provider.provider]}
						sentToday={provider.sentToday}
						dailyCap={provider.dailyCap}
						complete={complete}
					/>
				))}
			</div>
		</div>
	);
}

function ProvisioningCard({ index, total }: { index: number; total: number }) {
	return (
		<div className={cn(CARD, "px-5 py-5")}>
			<p className="font-medium text-label-md text-text-strong-950">
				IP {index} of {total}
			</p>
			<p className="mt-1 text-paragraph-sm text-text-sub-600">
				We're provisioning this address. Warmup starts the day it's assigned.
			</p>
		</div>
	);
}

export function DedicatedIpPage() {
	const router = useRouter();
	const checkout = useBillingCheckout();
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();
	const { data: usage } = useBillingUsage();
	const sendingIps = useSendingIps(Boolean(canManageBilling));

	useEffect(() => {
		if (!rolePending && !canManageBilling) {
			router.push(SETTINGS_MEMBER_HOME);
		}
	}, [canManageBilling, rolePending, router]);

	if (rolePending || !canManageBilling) {
		return null;
	}

	const data = sendingIps.data;
	const dedicatedIpCount =
		data?.dedicatedIpCount ?? usage?.plan.entitlements?.dedicatedIpCount ?? 0;
	const entitled = usage?.billingEnabled === false || dedicatedIpCount > 0;
	const items = data?.items ?? [];
	const pendingSlots = Math.max(0, dedicatedIpCount - items.length);

	const currentPlanId = resolvePlanId({
		id: usage?.plan.id ?? usage?.subscription.planId,
		name: usage?.plan.name,
	});
	const nextPlan = getNextPlan(currentPlanId);

	const handleUpgrade = () => {
		if (!nextPlan) {
			router.push("/settings/billing/plans");
			return;
		}
		if (nextPlan.monthlyPrice === null) {
			contactEnterprise();
			return;
		}
		if (isCheckoutPlanId(nextPlan.id)) {
			checkout.mutate(nextPlan.id);
			return;
		}
		router.push("/settings/billing/plans");
	};

	return (
		<div className="w-full space-y-6 pt-5">
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h5">
					Dedicated IP
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					{entitled
						? "Sending addresses reserved for this organization, with warmup by mailbox provider."
						: "Dedicated IPs isolate your traffic and warm up per provider: Gmail, Microsoft, Yahoo, and Apple."}
				</p>
			</div>

			{sendingIps.error ? (
				<div className="rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
					Failed to load dedicated IPs.{" "}
					<button
						type="button"
						onClick={() => void sendingIps.refetch()}
						className="underline"
					>
						Retry
					</button>
				</div>
			) : null}

			{sendingIps.isPending ? (
				<div className={cn(CARD, "h-48 animate-pulse bg-bg-weak-50/50")} />
			) : !entitled ? (
				<div className={cn(CARD, "px-5 py-6")}>
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-weak-50 dark:bg-white/[0.06]">
						<Icon name="dedicated-ip" className="h-4 w-4 text-text-sub-600" />
					</div>
					<h2 className="mt-4 font-semibold text-label-md text-text-strong-950">
						Included on Startup and Enterprise
					</h2>
					<p className="mt-1 max-w-md text-paragraph-sm text-text-sub-600">
						A dedicated sending IP warms up separately at each mailbox provider
						so a Gmail spike doesn’t burn Microsoft reputation.
					</p>
					<div className="mt-4 flex flex-wrap items-center gap-3">
						<FancyButton.Root
							variant="primary"
							size="small"
							onClick={handleUpgrade}
							disabled={checkout.isPending}
						>
							{nextPlan ? `Upgrade to ${nextPlan.name}` : "See plans"}
						</FancyButton.Root>
						<Link
							href="/settings/billing/plans"
							className="font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
						>
							Compare plans
						</Link>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					{items.length === 0 && pendingSlots === 0 ? (
						<p className="text-paragraph-sm text-text-sub-600">
							No dedicated IPs are assigned to this organization yet.
						</p>
					) : null}
					{items.map((ip) => (
						<IpCard key={ip.id} ip={ip} />
					))}
					{Array.from({ length: pendingSlots }, (_, i) => (
						<ProvisioningCard
							key={`pending-${i}`}
							index={items.length + i + 1}
							total={dedicatedIpCount}
						/>
					))}
				</div>
			)}
		</div>
	);
}
