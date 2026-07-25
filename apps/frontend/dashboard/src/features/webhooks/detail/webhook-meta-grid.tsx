import type { WebhookDetailData } from "#/features/webhooks/hooks/use-webhooks-query";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { formatRelativeTime } from "#/utils/format-relative-time";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCallback, useState } from "react";

function CopyButton({
	value,
	className,
}: {
	value: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(
		async (e: React.MouseEvent) => {
			e.stopPropagation();
			try {
				await navigator.clipboard.writeText(value);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				// ignore
			}
		},
		[value],
	);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={cn(
				"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40",
				copied && "border-success-base/30 text-success-base",
				className,
			)}
			title={copied ? "Copied" : "Copy"}
		>
			<Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
		</button>
	);
}

function DetailRow({
	label,
	value,
	displayValue,
	mono,
	tooltip,
	copyable = true,
	trailing,
	action,
}: {
	label: string;
	/** Value used for clipboard (and default display). */
	value: string;
	/** Optional display override (e.g. masked secret). */
	displayValue?: string;
	mono?: boolean;
	tooltip?: string;
	copyable?: boolean;
	trailing?: React.ReactNode;
	action?: React.ReactNode;
}) {
	const [copied, setCopied] = useState(false);
	const shown = displayValue ?? value;

	const handleCopy = useCallback(async () => {
		if (!copyable || !value) return;
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	}, [value, copyable]);

	return (
		<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 last:border-b-0 dark:border-stroke-soft-100/40">
			<div className="min-w-[120px] shrink-0 sm:min-w-[140px]">
				<div className="flex items-center gap-1">
					<span className="font-medium text-text-sub-600 text-xs">{label}</span>
					{tooltip ? (
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<button type="button" className="text-text-soft-400">
										<Icon name="info-outline" className="h-3 w-3" />
									</button>
								</Tooltip.Trigger>
								<Tooltip.Content side="top">
									<p className="max-w-[220px] text-xs">{tooltip}</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					) : null}
				</div>
			</div>

			{copyable ? (
				<button
					type="button"
					onClick={handleCopy}
					className="group flex min-w-0 flex-1 items-center gap-2 text-left"
				>
					<span
						className={cn(
							"truncate font-medium text-sm text-text-strong-950 transition-colors",
							mono && "font-mono",
							copied && "text-success-base",
						)}
					>
						{copied ? "Copied" : shown}
					</span>
				</button>
			) : (
				<span
					className={cn(
						"min-w-0 flex-1 truncate font-medium text-sm text-text-strong-950",
						mono && "font-mono",
					)}
				>
					{shown}
				</span>
			)}

			{trailing}
			{action ?? (copyable && value ? <CopyButton value={value} /> : null)}
		</div>
	);
}

function statusLabel(status: string) {
	switch (status) {
		case "active":
			return "Enabled";
		case "paused":
			return "Paused";
		case "disabled":
			return "Disabled";
		case "failed":
			return "Failed";
		default:
			return status || "Unknown";
	}
}

function statusClass(status: string) {
	switch (status) {
		case "active":
			return "text-success-base";
		case "paused":
			return "text-warning-base";
		case "failed":
			return "text-error-base";
		default:
			return "text-text-strong-950";
	}
}

/** Complete webhook details in SMTP credentials-style rows. */
export function WebhookMetaGrid({
	webhook,
	isLoading,
}: {
	webhook: WebhookDetailData | undefined | null;
	isLoading?: boolean;
}) {
	const [secretVisible, setSecretVisible] = useState(false);

	if (isLoading) {
		return (
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 last:border-b-0 dark:border-stroke-soft-100/40"
					>
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 flex-1" />
						<Skeleton className="h-8 w-8 rounded-lg" />
					</div>
				))}
			</div>
		);
	}

	if (!webhook) return null;

	const totalDeliveries = webhook.successCount + webhook.failureCount;
	const successRate =
		totalDeliveries > 0
			? `${Math.round((webhook.successCount / totalDeliveries) * 100)}%`
			: "—";

	const eventsList =
		webhook.events && webhook.events.length > 0
			? webhook.events.join(", ")
			: "None";

	const secret = webhook.secret ?? "";
	const maskedSecret = !secret
		? "—"
		: secretVisible
			? secret
			: secret.startsWith("whsec_")
				? `whsec_${"•".repeat(24)}`
				: "•".repeat(28);

	const headersJson =
		webhook.customHeaders && Object.keys(webhook.customHeaders).length > 0
			? JSON.stringify(webhook.customHeaders)
			: "—";

	return (
		<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
			{/* Identity */}
			<DetailRow label="Name" value={webhook.name || "—"} />
			<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
				<div className="min-w-[120px] shrink-0 sm:min-w-[140px]">
					<span className="font-medium text-text-sub-600 text-xs">Status</span>
				</div>
				<span
					className={cn(
						"min-w-0 flex-1 font-medium text-sm capitalize",
						statusClass(webhook.status),
					)}
				>
					{statusLabel(webhook.status)}
				</span>
			</div>
			<DetailRow
				label="Endpoint"
				value={webhook.url}
				mono
				tooltip="Public URL that receives signed event payloads"
			/>
			<DetailRow
				label="Webhook ID"
				value={webhook.id}
				mono
				tooltip="Unique identifier for this endpoint"
			/>

			{/* Auth */}
			<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
				<div className="min-w-[120px] shrink-0 sm:min-w-[140px]">
					<div className="flex items-center gap-1">
						<span className="font-medium text-text-sub-600 text-xs">
							Secret
						</span>
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<button type="button" className="text-text-soft-400">
										<Icon name="info-outline" className="h-3 w-3" />
									</button>
								</Tooltip.Trigger>
								<Tooltip.Content side="top">
									<p className="max-w-[220px] text-xs">
										HMAC signing secret used to verify deliveries
									</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>
				</div>
				<span className="min-w-0 flex-1 truncate font-medium font-mono text-sm text-text-strong-950">
					{maskedSecret}
				</span>
				{secret ? (
					<>
						<button
							type="button"
							onClick={() => setSecretVisible((v) => !v)}
							className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40"
							title={secretVisible ? "Hide secret" : "Show secret"}
						>
							<Icon
								name={secretVisible ? "eye-outline" : "eye-slash-outline"}
								className="h-3.5 w-3.5"
							/>
						</button>
						<CopyButton value={secret} />
					</>
				) : null}
			</div>

			{/* Events */}
			<DetailRow
				label="Events"
				value={
					webhook.events && webhook.events.length > 0
						? webhook.events.join("\n")
						: ""
				}
				displayValue={
					webhook.events && webhook.events.length > 0
						? `${webhook.events.length} event${webhook.events.length === 1 ? "" : "s"} · ${eventsList}`
						: "None"
				}
				copyable={!!webhook.events?.length}
				tooltip="Event types this endpoint is subscribed to"
			/>

			{/* Delivery stats */}
			<DetailRow
				label="Deliveries"
				value={String(totalDeliveries)}
				displayValue={totalDeliveries.toLocaleString()}
				copyable={false}
			/>
			<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
				<div className="min-w-[120px] shrink-0 sm:min-w-[140px]">
					<span className="font-medium text-text-sub-600 text-xs">
						Success rate
					</span>
				</div>
				<span className="min-w-0 flex-1 font-medium text-sm text-text-strong-950 tabular-nums">
					{successRate}
					{totalDeliveries > 0 ? (
						<span className="ml-2 font-normal text-text-sub-600 text-xs">
							({webhook.successCount.toLocaleString()} ok ·{" "}
							{webhook.failureCount.toLocaleString()} failed)
						</span>
					) : null}
				</span>
			</div>
			<DetailRow
				label="Consecutive fails"
				value={String(webhook.consecutiveFailures ?? 0)}
				displayValue={String(webhook.consecutiveFailures ?? 0)}
				copyable={false}
				tooltip="How many deliveries failed in a row"
			/>

			{/* Timing / ownership */}
			<DetailRow
				label="Last triggered"
				value={
					webhook.lastTriggeredAt
						? new Date(webhook.lastTriggeredAt).toISOString()
						: ""
				}
				displayValue={
					webhook.lastTriggeredAt
						? formatRelativeTime(webhook.lastTriggeredAt)
						: "Never"
				}
				copyable={!!webhook.lastTriggeredAt}
			/>
			<DetailRow
				label="Created"
				value={webhook.createdAt ? new Date(webhook.createdAt).toISOString() : ""}
				displayValue={
					webhook.createdAt ? formatRelativeTime(webhook.createdAt) : "—"
				}
				copyable={!!webhook.createdAt}
			/>
			<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
				<div className="min-w-[120px] shrink-0 sm:min-w-[140px]">
					<span className="font-medium text-text-sub-600 text-xs">
						Created by
					</span>
				</div>
				<div className="flex min-w-0 flex-1 items-center gap-2">
					{webhook.createdBy ? (
						<>
							<Avatar.Root size="20" color="blue" className="shrink-0">
								{webhook.createdBy.image ? (
									<Avatar.Image
										src={webhook.createdBy.image}
										alt={webhook.createdBy.name || "User"}
									/>
								) : (
									<Avatar.Image asChild>
										<div
											className={cn(
												"flex h-full w-full items-center justify-center rounded-full font-medium text-[8px] text-white uppercase tracking-wide",
												getAvatarGradient(
													webhook.createdBy.email || "unknown@reloop.sh",
												),
											)}
										>
											{getAvatarInitial(
												webhook.createdBy.name || null,
												webhook.createdBy.email || "unknown@reloop.sh",
											)}
										</div>
									</Avatar.Image>
								)}
							</Avatar.Root>
							<span className="truncate font-medium text-sm text-text-strong-950">
								{webhook.createdBy.name ||
									webhook.createdBy.email ||
									"Unknown"}
							</span>
						</>
					) : (
						<span className="font-medium text-sm text-text-sub-600">
							Unknown
						</span>
					)}
				</div>
			</div>
			<DetailRow
				label="Updated"
				value={webhook.updatedAt ? new Date(webhook.updatedAt).toISOString() : ""}
				displayValue={
					webhook.updatedAt ? formatRelativeTime(webhook.updatedAt) : "—"
				}
				copyable={!!webhook.updatedAt}
			/>

			{/* Delivery config */}
			<DetailRow
				label="Rate limiting"
				value={webhook.rateLimitEnabled ? "Enabled" : "Disabled"}
				copyable={false}
				tooltip="Whether delivery rate limits are applied"
			/>
			<DetailRow
				label="Max per minute"
				value={String(webhook.maxRequestsPerMinute ?? "—")}
				copyable={false}
			/>
			<DetailRow
				label="Max retries"
				value={String(webhook.maxRetries ?? "—")}
				copyable={false}
				tooltip="How many times a failed delivery is retried"
			/>
			<DetailRow
				label="Retry backoff"
				value={
					webhook.retryBackoffMultiplier != null
						? `${webhook.retryBackoffMultiplier}×`
						: "—"
				}
				copyable={false}
				tooltip="Multiplier applied between retry attempts"
			/>
			<DetailRow
				label="Custom headers"
				value={headersJson === "—" ? "" : headersJson}
				displayValue={headersJson}
				mono
				copyable={headersJson !== "—"}
				tooltip="Extra HTTP headers sent with each delivery"
			/>
		</div>
	);
}
