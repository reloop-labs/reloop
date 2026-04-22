"use client";

import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface LogDrawerProps {
	logId: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
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

const getStatusColor = (statusCode: number | null | undefined) => {
	if (!statusCode) return null;
	if (statusCode >= 200 && statusCode < 400)
		return {
			color: "text-success-base",
			bg: "bg-success-alpha-10",
			border: "border-success-soft-200",
		};
	return {
		color: "text-error-base",
		bg: "bg-error-alpha-10",
		border: "border-error-soft-200",
	};
};

const EVENT_SOURCE_ICONS: Record<string, string> = {
	email: "mail",
	auth: "lock",
	domain: "globe",
	"api-key": "key-new",
	webhook: "link",
	contact: "users",
	template: "file-text",
	settings: "settings",
	manual: "edit",
};

const getEventIcon = (event: string) => {
	const source = event.split(".")[0];
	if (!source) return "terminal";
	return EVENT_SOURCE_ICONS[source] || "terminal";
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

function FieldRow({
	label,
	icon,
	children,
}: {
	label: string;
	icon?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-start justify-between gap-3 py-2">
			<div className="flex items-center gap-2">
				{icon && (
					<Icon
						name={icon as "mail-single"}
						className="h-4 w-4 text-text-sub-600"
					/>
				)}
				<span className="shrink-0 text-text-sub-600 text-xs">{label}</span>
			</div>
			<div className="flex items-center gap-1 text-right">{children}</div>
		</div>
	);
}

function FieldValue({
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

function Section({
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
			<div className="flex items-center justify-between px-4 py-2.5">
				<div className="flex items-center gap-2">
					{icon && (
						<Icon
							name={icon as "activity"}
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
					)}
					<span className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
						{title}
					</span>
				</div>
				{actions}
			</div>
			<div className="border-stroke-soft-100 border-t px-4">{children}</div>
		</div>
	);
}

export const LogDrawer = ({ logId, isOpen, onOpenChange }: LogDrawerProps) => {
	const { data: log, isLoading } = useSWR<LogDetail>(
		logId && isOpen ? `/api/logs/v1/${logId}` : null,
		{
			revalidateOnFocus: false,
		},
	);

	const levelConfig = log ? getLevelConfig(log.level) : null;
	const statusConfig = log ? getStatusColor(log.status_code) : null;
	const hasRequestDetails =
		log?.requestDetails && Object.keys(log.requestDetails).length > 0;
	const metadataEntries = log ? Object.entries(log.metadata || {}) : [];

	return (
		<Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
			<Drawer.Content className="max-w-[480px]">
				<Drawer.Header className="border-stroke-soft-200 border-b">
					<div className="flex flex-1 flex-col gap-1">
						{isLoading ? (
							<>
								<Skeleton className="h-5 w-48" />
								<Skeleton className="h-4 w-32" />
							</>
						) : log ? (
							<>
								<div className="flex items-center gap-2.5">
									<Icon
										name={getEventIcon(log.event) as "terminal"}
										className={cn(
											"h-4.5 w-4.5 shrink-0",
											log.status_code
												? log.status_code >= 200 && log.status_code < 400
													? "text-success-base"
													: "text-error-base"
												: "text-text-sub-600",
										)}
									/>
									<Drawer.Title className="truncate">{log.event}</Drawer.Title>
								</div>
								<div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600">
									<span>{new Date(log.created_at).toLocaleString()}</span>
									<span className="text-text-disabled-300">·</span>
									<span>{formatRelativeTime(log.created_at)}</span>
								</div>
							</>
						) : (
							<Drawer.Title>Log Details</Drawer.Title>
						)}
					</div>
				</Drawer.Header>

				<Drawer.Body className="flex flex-col gap-4 overflow-y-auto p-4">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-20 rounded-xl" />
							<Skeleton className="h-20 rounded-xl" />
							<Skeleton className="h-28 rounded-xl" />
						</div>
					) : log ? (
						<>
							{/* Badges Row */}
							<div className="flex items-center gap-2">
								{levelConfig && (
									<span
										className={cn(
											"inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium text-[10px] capitalize",
											levelConfig.color,
											levelConfig.bg,
											levelConfig.border,
										)}
									>
										<Icon
											name={levelConfig.icon as "terminal"}
											className="h-3 w-3"
										/>
										{log.level}
									</span>
								)}
								{statusConfig && log.status_code && (
									<span
										className={cn(
											"inline-flex items-center rounded-md border px-2 py-1 font-medium text-[10px]",
											statusConfig.color,
											statusConfig.bg,
											statusConfig.border,
										)}
									>
										{log.status_code}
									</span>
								)}
							</div>

							{/* Event Info */}
							<Section title="Event" icon="activity">
								<FieldRow label="Event">
									<FieldValue value={log.event} />
								</FieldRow>
								<FieldRow label="Level">
									<FieldValue value={log.level} />
								</FieldRow>
								<FieldRow label="Log ID">
									<FieldValue value={log.uuid} mono copyable />
								</FieldRow>
								<FieldRow label="Trace ID">
									<FieldValue value={log.trace_id} mono copyable />
								</FieldRow>
							</Section>

							{/* Request Details */}
							{hasRequestDetails && (
								<Section title="Request" icon="globe">
									{log.requestDetails.method && log.requestDetails.endpoint && (
										<FieldRow label="Endpoint">
											<FieldValue
												value={`${log.requestDetails.method} ${log.requestDetails.endpoint}`}
												mono
											/>
										</FieldRow>
									)}
									<FieldRow label="IP Address">
										<FieldValue
											value={log.requestDetails.ipAddress as string}
											mono
											copyable
										/>
									</FieldRow>
									<FieldRow label="User Agent">
										<FieldValue
											value={log.requestDetails.userAgent as string}
											maxLength={60}
										/>
									</FieldRow>
								</Section>
							)}

							{/* Metadata */}
							<Section
								title="Metadata"
								icon="code"
								actions={
									metadataEntries.length > 0 ? (
										<CopyButton
											value={JSON.stringify(log.metadata, null, 2)}
											label="Metadata"
										/>
									) : undefined
								}
							>
								{metadataEntries.length > 0 ? (
									metadataEntries.map(([key, value]) => (
										<FieldRow key={key} label={key}>
											<FieldValue
												value={
													typeof value === "object"
														? JSON.stringify(value)
														: String(value ?? "—")
												}
												mono
											/>
										</FieldRow>
									))
								) : (
									<div className="py-3 text-center text-text-soft-400 text-xs">
										No metadata
									</div>
								)}
							</Section>
						</>
					) : null}
				</Drawer.Body>

				{log && (
					<Drawer.Footer className="border-stroke-soft-200 border-t">
						<Link
							href={`/logs/${log.uuid}`}
							className="flex w-full items-center justify-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-4 py-2 font-medium text-sm text-text-strong-950 transition-colors hover:bg-bg-weak-50"
						>
							View Full Details
							<Icon name="arrow-right" className="h-4 w-4" />
						</Link>
					</Drawer.Footer>
				)}
			</Drawer.Content>
		</Drawer.Root>
	);
};
