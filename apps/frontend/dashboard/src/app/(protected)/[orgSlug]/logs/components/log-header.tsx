"use client";

import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface LogHeaderProps {
	log?: {
		uuid: string;
		event: string;
		level: string;
		status_code?: number | null;
		trace_id: string | null;
		created_at: string;
		requestDetails?: {
			endpoint?: string;
			method?: string;
			userAgent?: string;
			ipAddress?: string;
			[key: string]: unknown;
		};
		metadata?: Record<string, unknown>;
	};
	isLoading: boolean;
}

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

const getLevelColor = (level: string) => {
	switch (level?.toLowerCase()) {
		case "error":
		case "fatal":
			return "text-error-base";
		case "warn":
			return "text-warning-base";
		case "info":
			return "text-primary-base";
		default:
			return "text-text-sub-600";
	}
};

const getLevelIcon = (level: string) => {
	switch (level?.toLowerCase()) {
		case "error":
		case "fatal":
			return "alert-triangle";
		case "warn":
			return "alert-triangle";
		case "info":
			return "info-outline";
		default:
			return "terminal";
	}
};

const getStatusColor = (statusCode: number | null | undefined) => {
	if (!statusCode) return "text-text-sub-600";
	if (statusCode >= 200 && statusCode < 400) return "text-success-base";
	return "text-error-base";
};

const getStatusIcon = (statusCode: number | null | undefined) => {
	if (!statusCode) return "minus";
	if (statusCode >= 200 && statusCode < 400) return "check-circle";
	return "cross-circle";
};

export const LogHeader = ({ log, isLoading }: LogHeaderProps) => {
	const [copiedId, setCopiedId] = useState(false);
	const [copiedTrace, setCopiedTrace] = useState(false);

	const handleCopy = useCallback(
		async (value: string, setCopied: (v: boolean) => void, label: string) => {
			try {
				await navigator.clipboard.writeText(value);
				setCopied(true);
				toast.success(`${label} copied`);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy");
			}
		},
		[],
	);

	if (!log && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => window.history.back()} />
				<div className="flex items-center justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Log
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								---
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-error-base">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-xs">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-title-h6 leading-8">
							Log not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-10 pb-8">
			<AnimatedBackButton onClick={() => window.history.back()} />
			<div className="flex items-center justify-between pt-6">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-10 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<div className="flex items-center gap-1">
								<Skeleton className="h-3.5 w-3.5 rounded-full" />
								<Skeleton className="h-4 w-12 rounded-full" />
							</div>
							<Skeleton className="h-1 w-1 rounded-full" />
							<div className="flex items-center gap-1">
								<Skeleton className="h-3.5 w-3.5 rounded-full" />
								<Skeleton className="h-4 w-16 rounded-full" />
							</div>
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Log
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								{log?.created_at ? formatRelativeTime(log.created_at) : "---"}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div
								className={cn(
									"flex items-center gap-1",
									getLevelColor(log?.level || ""),
								)}
							>
								<Icon
									name={getLevelIcon(log?.level || "") as any}
									className="h-3.5 w-3.5"
								/>
								<p className="font-medium text-paragraph-xs capitalize">
									{log?.level}
								</p>
							</div>
							{log?.status_code && (
								<>
									<p className="font-semibold text-paragraph-xs text-text-sub-600">
										•
									</p>
									<div
										className={cn(
											"flex items-center gap-1",
											getStatusColor(log.status_code),
										)}
									>
										<Icon
											name={getStatusIcon(log.status_code) as any}
											className="h-3.5 w-3.5"
										/>
										<p className="font-medium text-paragraph-xs">
											{log.status_code}
										</p>
									</div>
								</>
							)}
						</div>
					)}
					{isLoading ? (
						<Skeleton className="mt-2 h-7 w-48 rounded-lg" />
					) : (
						<div className="flex items-center gap-1">
							<Icon
								name={getEventIcon(log?.event || "") as any}
								className={cn(
									"h-4 w-4",
									log?.status_code
										? log.status_code >= 200 && log.status_code < 400
											? "text-success-base"
											: "text-error-base"
										: "text-text-sub-600",
								)}
							/>
							<h1 className="font-medium text-title-h6 leading-8">
								{log?.event}
							</h1>
						</div>
					)}
				</div>
			</div>

			{/* Stats Grid */}
			<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
				{/* Timestamp */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="clock" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Timestamp
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-32 rounded-lg" />
					) : (
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{log?.created_at
								? new Date(log.created_at).toLocaleString()
								: "---"}
						</span>
					)}
				</div>

				{/* Level */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon
							name={getLevelIcon(log?.level || "") as any}
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Level
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-16 rounded-lg" />
					) : (
						<span className={cn("font-medium text-paragraph-sm capitalize")}>
							{log?.level || "---"}
						</span>
					)}
				</div>

				{/* Status Code */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="hash" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Status Code
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-12 rounded-lg" />
					) : (
						<span className={cn("font-medium text-paragraph-sm")}>
							{log?.status_code || "---"}
						</span>
					)}
				</div>

				{/* Log ID */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon
							name="fingerprint"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Log ID
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-6 w-28 rounded-lg" />
					) : (
						<button
							className="group/copy flex w-fit cursor-pointer items-center gap-1.5"
							type="button"
							onClick={() =>
								log?.uuid && handleCopy(log.uuid, setCopiedId, "Log ID")
							}
						>
							<code className="max-w-[120px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
								{log?.uuid?.slice(0, 18)}...
							</code>
							<Icon
								name={copiedId ? "check" : "copy"}
								className={cn(
									"h-3 w-3 flex-shrink-0 transition-all",
									copiedId ? "text-success-base" : "text-text-sub-600",
								)}
							/>
						</button>
					)}
				</div>

				{/* Trace ID */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="route" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Trace ID
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-6 w-28 rounded-lg" />
					) : log?.trace_id ? (
						<button
							className="group/copy flex w-fit cursor-pointer items-center gap-1.5"
							type="button"
							onClick={() =>
								handleCopy(log.trace_id!, setCopiedTrace, "Trace ID")
							}
						>
							<code className="max-w-[120px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
								{log.trace_id.slice(0, 18)}...
							</code>
							<Icon
								name={copiedTrace ? "check" : "copy"}
								className={cn(
									"h-3 w-3 flex-shrink-0 transition-all",
									copiedTrace ? "text-success-base" : "text-text-sub-600",
								)}
							/>
						</button>
					) : (
						<span className="font-medium text-paragraph-sm text-text-soft-400 italic">
							No trace
						</span>
					)}
				</div>

				{/* IP Address */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="globe" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							IP Address
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-28 rounded-lg" />
					) : (
						<span className="font-medium font-mono text-paragraph-sm text-text-strong-950">
							{(log?.requestDetails?.ipAddress as string) || "---"}
						</span>
					)}
				</div>
			</div>

			{/* Request Details Section */}
			<div className="mt-12">
				<h3 className="mb-4 font-medium text-paragraph-sm text-text-strong-950">
					Request Details
				</h3>
				<div className="grid grid-cols-3 gap-x-8 gap-y-8">
					{log?.requestDetails?.method && log?.requestDetails?.endpoint && (
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Endpoint
							</span>
							<span className="font-medium font-mono text-paragraph-sm text-text-strong-950">
								{log.requestDetails.method} {log.requestDetails.endpoint}
							</span>
						</div>
					)}
					{log?.requestDetails?.userAgent && (
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								User Agent
							</span>
							<Tooltip.Provider delayDuration={300}>
								<Tooltip.Root>
									<Tooltip.Trigger asChild>
										<span className="max-w-[300px] cursor-default truncate font-medium text-paragraph-sm text-text-strong-950">
											{String(log.requestDetails.userAgent)}
										</span>
									</Tooltip.Trigger>
									<Tooltip.Content
										side="top"
										variant="light"
										className="max-w-sm break-all font-mono text-xs"
									>
										{String(log.requestDetails.userAgent)}
									</Tooltip.Content>
								</Tooltip.Root>
							</Tooltip.Provider>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
