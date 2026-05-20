"use client";

import { CopyCodeBlock } from "@fe/dashboard/app/(protected)/onboarding/steps/generate-api-key/components/copy-code-block";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { DiagnosticCard } from "./diagnostic-card";

interface LogDetailPanelProps {
	logId: string | null;
}

interface LogDetail {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	trace_id: string | null;
	metadata: Record<string, unknown>;
	requestDetails: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		[key: string]: unknown;
	};
	created_at: string;
}

const getLevelConfig = (level: string) => {
	switch (level?.toLowerCase()) {
		case "error":
		case "fatal":
			return {
				color: "text-error-base",
				bg: "bg-error-alpha-10",
				border: "border-error-soft-200",
				icon: "alert-triangle",
			};
		case "warn":
			return {
				color: "text-warning-base",
				bg: "bg-warning-alpha-10",
				border: "border-warning-soft-200",
				icon: "alert-triangle",
			};
		case "info":
			return {
				color: "text-primary-base",
				bg: "bg-primary-alpha-10",
				border: "border-primary-soft-200",
				icon: "info-outline",
			};
		default:
			return {
				color: "text-text-sub-600",
				bg: "bg-neutral-alpha-10",
				border: "border-stroke-soft-200",
				icon: "terminal",
			};
	}
};

const getStatusBadge = (statusCode: number | null | undefined) => {
	if (!statusCode) return null;
	const ok = statusCode >= 200 && statusCode < 400;
	return ok
		? "bg-[#d1fae5] text-[#065f46] dark:bg-emerald-950/60 dark:text-emerald-400"
		: "bg-[#fee2e2] text-[#991b1b] dark:bg-red-950/60 dark:text-red-400";
};

const getMethodBadgeClasses = (method: string) => {
	switch (method?.toUpperCase()) {
		case "GET":
			return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
		case "POST":
			return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
		case "PUT":
		case "PATCH":
			return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
		case "DELETE":
			return "bg-rose-500/10 text-rose-700 dark:text-rose-400";
		default:
			return "bg-neutral-alpha-10 text-text-sub-600";
	}
};

/** Strip protocol + host from a URL, keeping only the path */
const stripBasePath = (url: string) => {
	try {
		return new URL(url).pathname;
	} catch {
		return url;
	}
};

function CopyButton({ value, label }: { value: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast.success(label ? `${label} copied` : "Copied");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	}, [value, label]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="rounded p-0.5 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
			title={`Copy ${label || "value"}`}
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("h-3 w-3", copied && "text-success-base")}
			/>
		</button>
	);
}

function PropertyRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid grid-cols-[120px_1fr] items-start gap-4 py-2.5">
			<span className="text-text-sub-600 text-xs">{label}</span>
			<div className="flex min-w-0 flex-1 items-center gap-1.5 text-right">
				{children}
			</div>
		</div>
	);
}

function PropertyValue({
	value,
	mono,
	copyable,
	maxLength,
}: {
	value: string | null | undefined;
	mono?: boolean;
	copyable?: boolean;
	maxLength?: number;
}) {
	if (!value) return <span className="text-text-soft-400 text-xs">—</span>;

	const isTruncated = maxLength && value.length > maxLength;
	const display = isTruncated ? `${value.slice(0, maxLength)}…` : value;

	const content = (
		<span className={cn("text-text-strong-950 text-xs", mono && "font-mono")}>
			{display}
		</span>
	);

	return (
		<>
			{isTruncated ? (
				<Tooltip.Provider delayDuration={300}>
					<Tooltip.Root>
						<Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
						<Tooltip.Content
							side="top"
							variant="light"
							className="max-w-sm break-all font-mono text-xs"
						>
							{value}
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			) : (
				content
			)}
			{copyable && <CopyButton value={value} label={mono ? "ID" : undefined} />}
		</>
	);
}

/**
 * Inline log detail panel — used in the right-side split panel of the logs list.
 * Also used inside the drawer for the mobile/narrow-viewport experience.
 */
export const LogDetailPanel = ({ logId }: LogDetailPanelProps) => {
	const { data: log, isLoading } = useSWR<LogDetail>(
		logId ? `/api/logs/v1/${logId}` : null,
		{ revalidateOnFocus: false },
	);

	const levelConfig = log ? getLevelConfig(log.level) : null;
	const statusBadgeClass = log ? getStatusBadge(log.status_code) : null;
	const metadataEntries = log ? Object.entries(log.metadata || {}) : [];
	const hasRequestDetails =
		log?.requestDetails && Object.keys(log.requestDetails).length > 0;

	/* ── Loading ── */
	if (isLoading) {
		return (
			<div className="flex flex-col gap-4 p-5">
				{/* Title skeleton */}
				<div className="border-stroke-soft-100 border-b pb-4 dark:border-stroke-soft-100/40">
					<Skeleton className="h-5 w-56 rounded" />
					<Skeleton className="mt-2 h-3.5 w-36 rounded" />
				</div>
				{/* Property rows */}
				<div className="space-y-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="grid grid-cols-[120px_1fr] gap-4">
							<Skeleton className="h-3.5 w-20 rounded" />
							<Skeleton className="h-3.5 w-32 rounded" />
						</div>
					))}
				</div>
				<Skeleton className="mt-4 h-40 rounded-xl" />
			</div>
		);
	}

	if (!log) return null;

	const method = log.requestDetails?.method as string | undefined;
	const endpoint = log.requestDetails?.endpoint as string | undefined;
	const displayEndpoint = endpoint ? stripBasePath(endpoint) : undefined;
	const title =
		method && displayEndpoint ? `${method} ${displayEndpoint}` : log.event;

	return (
		<div className="flex flex-col">
			{/* ── Panel Header ── */}
			<div className="flex items-start justify-between gap-3 px-5 pt-4">
				<div className="min-w-0 flex-1">
					<h2 className="truncate font-semibold text-sm text-text-strong-950">
						{title}
					</h2>
					<div className="mt-1 flex items-center gap-2 text-text-sub-600 text-xs">
						<span>{new Date(log.created_at).toLocaleString()}</span>
						<span className="text-text-disabled-300">·</span>
						<span>{formatRelativeTime(log.created_at)}</span>
					</div>
				</div>
				<Link
					href={`/logs/${log.uuid}`}
					className="flex-shrink-0 rounded-md p-1 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
					title="View full details"
				>
					<Icon name="arrows-expand-diagonal" className="h-3.5 w-3.5" />
				</Link>
			</div>

			{/* ── Body ── */}
			<div className="flex-1 space-y-4 p-5">
				{/* Diagnostic card */}
				<DiagnosticCard log={log} />

				{/* Property table */}
				<div className="rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<div className="divide-y divide-stroke-soft-100 px-4 dark:divide-stroke-soft-100/40">
						<PropertyRow label="Status">
							{log.status_code ? (
								<span
									className={cn(
										"inline-flex items-center rounded-md px-2 py-0.5 font-semibold text-[11px]",
										statusBadgeClass || "bg-neutral-alpha-10 text-text-sub-600",
									)}
								>
									{log.status_code}
								</span>
							) : (
								<span className="text-text-soft-400 text-xs">—</span>
							)}
						</PropertyRow>

						<PropertyRow label="Request ID">
							<PropertyValue value={log.uuid} mono copyable maxLength={26} />
						</PropertyRow>

						<PropertyRow label="Time">
							<PropertyValue
								value={new Date(log.created_at).toLocaleString()}
							/>
						</PropertyRow>

						{hasRequestDetails && log.requestDetails.ipAddress && (
							<PropertyRow label="IP address">
								<PropertyValue
									value={log.requestDetails.ipAddress as string}
									mono
									copyable
								/>
							</PropertyRow>
						)}

						{log.trace_id && (
							<PropertyRow label="Trace ID">
								<PropertyValue
									value={log.trace_id}
									mono
									copyable
									maxLength={26}
								/>
							</PropertyRow>
						)}

						{hasRequestDetails && log.requestDetails.userAgent && (
							<PropertyRow label="Source">
								<PropertyValue
									value={log.requestDetails.userAgent as string}
									maxLength={55}
								/>
							</PropertyRow>
						)}

						{hasRequestDetails &&
							log.requestDetails.endpoint &&
							(() => {
								try {
									const origin = new URL(log.requestDetails.endpoint as string)
										.origin;
									return (
										<PropertyRow label="Origin">
											<PropertyValue value={origin} mono maxLength={50} />
										</PropertyRow>
									);
								} catch {
									return null;
								}
							})()}
					</div>
				</div>

				{/* Response body */}
				{metadataEntries.length > 0 ? (
					<div>
						<CopyCodeBlock
							code={JSON.stringify(log.metadata, null, 2)}
							lang="json"
							label="Response body"
						/>
					</div>
				) : (
					<div className="rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
						<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-4 py-2.5 dark:border-stroke-soft-100/40">
							<Icon name="code" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
								Response body
							</span>
						</div>
						<div className="py-4 text-center text-text-soft-400 text-xs">
							No response body
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
