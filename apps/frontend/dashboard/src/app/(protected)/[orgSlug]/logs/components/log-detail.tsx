"use client";

import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface LogDetailProps {
	log?: {
		uuid: string;
		event: string;
		level: string;
		source?: string | null;
		created_at: string;
		metadata: Record<string, unknown>;
		requestDetails: {
			endpoint?: string;
			method?: string;
			userAgent?: string;
			ipAddress?: string;
			[key: string]: unknown;
		};
		trace_id: string | null;
	};
	isLoading: boolean;
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
				icon: "info",
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

function CopyButton({ value, label }: { value: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast.success(label ? `${label} copied` : "Copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	}, [value, label]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="rounded-md p-1 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
			title={`Copy ${label || "value"}`}
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("h-3.5 w-3.5", copied && "text-success-base")}
			/>
		</button>
	);
}

function DetailRow({
	label,
	value,
	mono,
	copyable,
	fullWidth,
}: {
	label: string;
	value: string | null | undefined;
	mono?: boolean;
	copyable?: boolean;
	fullWidth?: boolean;
}) {
	if (!value) return null;
	return (
		<div
			className={cn(
				"flex items-start justify-between gap-6 py-2.5",
				fullWidth && "flex-col gap-1",
			)}
		>
			<span className="shrink-0 text-sm text-text-sub-600">{label}</span>
			<div
				className={cn(
					"flex items-center gap-1.5",
					fullWidth ? "w-full" : "text-right",
				)}
			>
				<span
					className={cn(
						"text-sm text-text-strong-950",
						mono && "font-mono text-xs",
						fullWidth && "w-full break-all",
					)}
				>
					{value}
				</span>
				{copyable && <CopyButton value={value} label={label} />}
			</div>
		</div>
	);
}

function SectionCard({
	title,
	icon,
	children,
	actions,
}: {
	title: string;
	icon?: string;
	children: React.ReactNode;
	actions?: React.ReactNode;
}) {
	return (
		<div className="rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
			<div className="flex items-center justify-between border-stroke-soft-100/50 border-b px-5 py-3">
				<div className="flex items-center gap-2">
					{icon && (
						<Icon name={icon as any} className="h-4 w-4 text-text-sub-600" />
					)}
					<h3 className="font-medium text-text-sub-600 text-xs uppercase tracking-wider">
						{title}
					</h3>
				</div>
				{actions}
			</div>
			<div className="px-5 py-3">{children}</div>
		</div>
	);
}

export const LogDetail = ({ log, isLoading }: LogDetailProps) => {
	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-12 w-12 rounded-xl" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-6 w-64" />
						<Skeleton className="h-4 w-48" />
					</div>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Skeleton className="h-40 rounded-xl" />
					<Skeleton className="h-40 rounded-xl" />
				</div>
				<Skeleton className="h-48 rounded-xl" />
			</div>
		);
	}

	if (!log) return null;

	const levelConfig = getLevelConfig(log.level);
	const hasRequestDetails =
		log.requestDetails && Object.keys(log.requestDetails).length > 0;
	const metadataEntries = Object.entries(log.metadata || {});

	return (
		<div className="space-y-6">
			{/* Header Hero */}
			<div className="flex items-start gap-4">
				<div
					className={cn(
						"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
						levelConfig.bg,
					)}
				>
					<Icon
						name={levelConfig.icon as any}
						className={cn("h-6 w-6", levelConfig.color)}
					/>
				</div>
				<div className="flex-1">
					<div className="flex items-center gap-2.5">
						<h2 className="font-semibold text-lg text-text-strong-950">
							{log.event}
						</h2>
						<span
							className={cn(
								"inline-flex items-center rounded-md border px-2 py-0.5 font-medium text-[10px] capitalize",
								levelConfig.color,
								levelConfig.bg,
								levelConfig.border,
							)}
						>
							{log.level}
						</span>
					</div>
					<div className="mt-1 flex items-center gap-3 text-sm text-text-sub-600">
						<span>{new Date(log.created_at).toLocaleString()}</span>
						<span className="text-text-disabled-300">·</span>
						<span>{formatRelativeTime(log.created_at)}</span>
						{log.source && (
							<>
								<span className="text-text-disabled-300">·</span>
								<span className="capitalize">
									{log.source.replace(/_/g, " ")}
								</span>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Two-column layout for Event + Request */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Event Information */}
				<SectionCard title="Event Information" icon="activity">
					<div className="divide-y divide-stroke-soft-100/50">
						<DetailRow label="Event" value={log.event} />
						<DetailRow label="Level" value={log.level} />
						<DetailRow
							label="Source"
							value={log.source?.replace(/_/g, " ") || null}
						/>
						<DetailRow
							label="Timestamp"
							value={new Date(log.created_at).toLocaleString()}
						/>
					</div>
				</SectionCard>

				{/* Request Details */}
				<SectionCard title="Request Details" icon="globe">
					<div className="divide-y divide-stroke-soft-100/50">
						{hasRequestDetails ? (
							<>
								{log.requestDetails.method && log.requestDetails.endpoint && (
									<DetailRow
										label="Endpoint"
										value={`${log.requestDetails.method} ${log.requestDetails.endpoint}`}
										mono
									/>
								)}
								<DetailRow
									label="IP Address"
									value={log.requestDetails.ipAddress}
									mono
									copyable
								/>
								<DetailRow
									label="User Agent"
									value={log.requestDetails.userAgent}
									fullWidth
								/>
							</>
						) : (
							<p className="py-4 text-center text-sm text-text-soft-400">
								No request details available
							</p>
						)}
					</div>
				</SectionCard>
			</div>

			{/* Identifiers */}
			<SectionCard title="Identifiers" icon="hash">
				<div className="divide-y divide-stroke-soft-100/50">
					<DetailRow label="Log ID" value={log.uuid} mono copyable />
					<DetailRow label="Trace ID" value={log.trace_id} mono copyable />
				</div>
			</SectionCard>

			{/* Metadata */}
			<SectionCard
				title="Metadata"
				icon="code"
				actions={
					metadataEntries.length > 0 ? (
						<CopyButton
							value={JSON.stringify(log.metadata, null, 2)}
							label="Metadata JSON"
						/>
					) : undefined
				}
			>
				{metadataEntries.length > 0 ? (
					<div className="divide-y divide-stroke-soft-100/50">
						{metadataEntries.map(([key, value]) => (
							<div
								key={key}
								className="flex items-start justify-between gap-4 py-2.5"
							>
								<span className="shrink-0 font-mono text-text-sub-600 text-xs">
									{key}
								</span>
								<span className="break-all text-right font-mono text-text-strong-950 text-xs">
									{typeof value === "object"
										? JSON.stringify(value, null, 2)
										: String(value ?? "—")}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="py-4 text-center text-sm text-text-soft-400">
						No metadata available
					</p>
				)}
			</SectionCard>

			{/* Raw JSON View */}
			<SectionCard
				title="Raw Log Data"
				icon="file-text"
				actions={
					<CopyButton value={JSON.stringify(log, null, 2)} label="Raw JSON" />
				}
			>
				<pre className="max-h-[400px] overflow-auto rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-4 font-mono text-text-strong-950 text-xs">
					{JSON.stringify(log, null, 2)}
				</pre>
			</SectionCard>
		</div>
	);
};
