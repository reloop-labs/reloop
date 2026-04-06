"use client";

import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface LogDrawerProps {
	logId: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	activeOrganizationSlug: string;
}

interface LogDetail {
	uuid: string;
	event: string;
	level: string;
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
				dot: "bg-error-base",
				label: level === "fatal" ? "Fatal" : "Error",
			};
		case "warn":
			return {
				color: "text-warning-base",
				bg: "bg-warning-alpha-10",
				border: "border-warning-soft-200",
				dot: "bg-warning-base",
				label: "Warning",
			};
		case "info":
			return {
				color: "text-primary-base",
				bg: "bg-primary-alpha-10",
				border: "border-primary-soft-200",
				dot: "bg-primary-base",
				label: "Info",
			};
		default:
			return {
				color: "text-text-sub-600",
				bg: "bg-neutral-alpha-10",
				border: "border-stroke-soft-200",
				dot: "bg-text-sub-600",
				label: "Debug",
			};
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

function InfoRow({
	label,
	value,
	mono,
	copyable,
}: {
	label: string;
	value: string | null | undefined;
	mono?: boolean;
	copyable?: boolean;
}) {
	if (!value) return null;
	return (
		<div className="flex items-start justify-between gap-4 py-1.5">
			<span className="shrink-0 text-text-sub-600 text-xs">{label}</span>
			<div className="flex items-center gap-1">
				<span
					className={cn(
						"text-right text-text-strong-950 text-xs",
						mono && "font-mono",
					)}
				>
					{value}
				</span>
				{copyable && <CopyButton value={value} label={label} />}
			</div>
		</div>
	);
}

function MetadataTable({ metadata }: { metadata: Record<string, unknown> }) {
	const entries = Object.entries(metadata);
	if (entries.length === 0) {
		return (
			<p className="py-2 text-center text-text-soft-400 text-xs">
				No metadata
			</p>
		);
	}

	return (
		<div className="divide-y divide-stroke-soft-100/50">
			{entries.map(([key, value]) => (
				<div
					key={key}
					className="flex items-start justify-between gap-3 py-1.5"
				>
					<span className="shrink-0 font-mono text-text-sub-600 text-xs">
						{key}
					</span>
					<span className="break-all text-right font-mono text-xs text-text-strong-950">
						{typeof value === "object"
							? JSON.stringify(value)
							: String(value ?? "—")}
					</span>
				</div>
			))}
		</div>
	);
}

export const LogDrawer = ({
	logId,
	isOpen,
	onOpenChange,
	activeOrganizationSlug,
}: LogDrawerProps) => {
	const { data: log, isLoading } = useSWR<LogDetail>(
		logId && isOpen ? `/api/logs/v1/${logId}` : null,
		{
			revalidateOnFocus: false,
		},
	);

	const levelConfig = log ? getLevelConfig(log.level) : null;

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
								<div className="flex items-center gap-2">
									<span
										className={cn(
											"inline-flex items-center rounded-md border px-1.5 py-0.5 font-medium text-[10px] capitalize",
											levelConfig?.color,
											levelConfig?.bg,
											levelConfig?.border,
										)}
									>
										{log.level}
									</span>
									<Drawer.Title className="truncate">
										{log.event}
									</Drawer.Title>
								</div>
								<p className="text-paragraph-xs text-text-sub-600">
									{new Date(log.created_at).toLocaleString()} ·{" "}
									{formatRelativeTime(log.created_at)}
								</p>
							</>
						) : (
							<Drawer.Title>Log Details</Drawer.Title>
						)}
					</div>
				</Drawer.Header>

				<Drawer.Body className="flex flex-col gap-5 overflow-y-auto p-5">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-24 rounded-xl" />
							<Skeleton className="h-24 rounded-xl" />
							<Skeleton className="h-32 rounded-xl" />
						</div>
					) : log ? (
						<>
							{/* Event Section */}
							<section className="rounded-xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/50">
								<h3 className="mb-2.5 font-medium text-text-sub-600 text-[11px] uppercase tracking-wider">
									Event
								</h3>
								<div className="space-y-0.5">
									<InfoRow label="Event" value={log.event} />
									<InfoRow label="Level" value={log.level} />
									<InfoRow
										label="Trace ID"
										value={log.trace_id}
										mono
										copyable
									/>
									<InfoRow label="Log ID" value={log.uuid} mono copyable />
								</div>
							</section>

							{/* Request Section */}
							{log.requestDetails &&
								Object.keys(log.requestDetails || {}).length > 0 && (
									<section className="rounded-xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/50">
										<h3 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-text-sub-600">
											Request
										</h3>
										<div className="space-y-0.5">
											{log.requestDetails.method &&
												log.requestDetails.endpoint && (
													<InfoRow
														label="Endpoint"
														value={`${log.requestDetails.method} ${log.requestDetails.endpoint}`}
														mono
													/>
												)}
											<InfoRow
												label="IP Address"
												value={log.requestDetails.ipAddress as string}
												mono
												copyable
											/>
											<InfoRow
												label="User Agent"
												value={
													log.requestDetails.userAgent
														? String(log.requestDetails.userAgent).length > 60
															? `${String(log.requestDetails.userAgent).slice(0, 60)}…`
															: String(log.requestDetails.userAgent)
														: null
												}
											/>
										</div>
									</section>
								)}

							{/* Metadata Section */}
							<section className="rounded-xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/50">
								<div className="mb-2.5 flex items-center justify-between">
									<h3 className="text-[11px] font-medium uppercase tracking-wider text-text-sub-600">
										Metadata
									</h3>
									{Object.keys(log.metadata || {}).length > 0 && (
										<CopyButton
											value={JSON.stringify(log.metadata, null, 2)}
											label="Metadata JSON"
										/>
									)}
								</div>
								<MetadataTable metadata={log.metadata || {}} />
							</section>
						</>
					) : null}
				</Drawer.Body>

				{log && (
					<Drawer.Footer className="border-stroke-soft-200 border-t">
						<Link
							href={`/${activeOrganizationSlug}/logs/${log.uuid}`}
							className="flex w-full items-center justify-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-4 py-2 text-sm font-medium text-text-strong-950 transition-colors hover:bg-bg-weak-50"
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
