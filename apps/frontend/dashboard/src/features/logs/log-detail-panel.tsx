import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { Link } from "#/lib/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { DiagnosticCard } from "./diagnostic-card";
import { useLogDetailQuery } from "./hooks/use-logs-query";

interface LogDetailPanelProps {
	logId: string | null;
}

/** Returns status label and badge color */
const getStatusProps = (statusCode: number | null | undefined) => {
	if (!statusCode) return null;

	// Determine status label & color
	let label = `${statusCode}`;
	let color = "gray";

	if (statusCode >= 200 && statusCode < 300) {
		label = `${statusCode} OK`;
		color = "gray";
	} else if (statusCode >= 300 && statusCode < 400) {
		label = `${statusCode} REDIR`;
		color = "blue";
	} else if (statusCode >= 400 && statusCode < 500) {
		label = `${statusCode} ERR`;
		color = "orange";
	} else if (statusCode >= 500) {
		label = `${statusCode} ERR`;
		color = "red";
	}

	return { label, color };
};

const getMethodColorClass = (method: string) => {
	switch (method?.toUpperCase()) {
		case "GET":
			return "text-emerald-700 dark:text-emerald-400";
		case "POST":
			return "text-blue-700 dark:text-blue-400";
		case "PUT":
		case "PATCH":
			return "text-amber-700 dark:text-amber-400";
		case "DELETE":
			return "text-rose-700 dark:text-rose-400";
		case "SMTP":
			return "text-purple-700 dark:text-purple-400";
		default:
			return "text-text-sub-600";
	}
};

/** Strip protocol + host from a URL, keeping only the path and stripping trailing slash */
const stripBasePath = (url: string) => {
	try {
		let path = new URL(url).pathname;
		if (path.length > 1 && path.endsWith("/")) {
			path = path.slice(0, -1);
		}
		return path;
	} catch {
		let path = url;
		if (path.length > 1 && path.endsWith("/")) {
			path = path.slice(0, -1);
		}
		return path;
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
			<div className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
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

function PropertyValueSkeleton({ className }: { className?: string }) {
	return <Skeleton className={cn("h-3.5 rounded-md", className)} />;
}

/**
 * Inline log detail panel — used in the right-side split panel of the logs list.
 * Also used inside the drawer for the mobile/narrow-viewport experience.
 */
export function LogDetailPanel({ logId }: LogDetailPanelProps) {
	const { data: log, isPending: isLoading } = useLogDetailQuery(logId);

	if (!isLoading && !log) return null;

	const statusProps = log ? getStatusProps(log.status_code) : null;
	const metadataEntries = log ? Object.entries(log.metadata || {}) : [];
	const hasRequestBody =
		!!log?.request_body && Object.keys(log.request_body).length > 0;
	const hasResponseBody = metadataEntries.length > 0;

	const method = log?.requestDetails?.method as string | undefined;
	const endpoint = log?.requestDetails?.endpoint as string | undefined;
	const displayEndpoint = endpoint ? stripBasePath(endpoint) : undefined;
	const ipAddress = log?.requestDetails?.ipAddress as string | undefined;
	const userAgent = log?.requestDetails?.userAgent as string | undefined;

	let origin: string | undefined;
	if (endpoint) {
		try {
			origin = new URL(endpoint).origin;
		} catch {
			origin = undefined;
		}
	}

	const requestCode = hasRequestBody
		? JSON.stringify(log?.request_body ?? {}, null, 2)
		: "";
	const responseCode = hasResponseBody
		? JSON.stringify(log?.metadata ?? {}, null, 2)
		: "";

	return (
		<div className="flex flex-col">
			{/* ── Panel Header ── */}
			<div className="flex items-start justify-between gap-3 px-5 pt-4">
				<div className="min-w-0 flex-1">
					{isLoading ? (
						<>
							{/* Match loaded title (text-sm) + subtitle (text-xs / mt-1) line boxes */}
							<div className="flex h-5 items-center gap-1.5">
								<PropertyValueSkeleton className="h-3 w-10" />
								<PropertyValueSkeleton className="h-3 w-40" />
							</div>
							<div className="mt-1 flex h-4 items-center gap-2">
								<PropertyValueSkeleton className="h-2.5 w-32" />
								<span className="text-text-disabled-300 text-xs">·</span>
								<PropertyValueSkeleton className="h-2.5 w-12" />
							</div>
						</>
					) : (
						<>
							<h2 className="flex h-5 items-center truncate font-semibold text-sm text-text-strong-950">
								{method && displayEndpoint ? (
									<>
										<span
											className={cn(
												"mr-1.5 font-bold uppercase",
												getMethodColorClass(method),
											)}
										>
											{method}
										</span>
										<span className="truncate">{displayEndpoint}</span>
									</>
								) : (
									log?.event
								)}
							</h2>
							<div className="mt-1 flex h-4 items-center gap-2 text-text-sub-600 text-xs">
								<span>
									{log?.created_at
										? new Date(log.created_at).toLocaleString()
										: null}
								</span>
								<span className="text-text-disabled-300">·</span>
								<span>
									{log?.created_at ? formatRelativeTime(log.created_at) : null}
								</span>
							</div>
						</>
					)}
				</div>
				{log ? (
					<Link
						to="/logs/$logId"
						params={{ logId: log.uuid }}
						className="shrink-0 rounded-md p-1 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
						title="View full details"
					>
						<Icon name="arrows-expand-diagonal" className="h-3.5 w-3.5" />
					</Link>
				) : (
					<span className="shrink-0 rounded-md p-1 text-text-soft-400">
						<Icon name="arrows-expand-diagonal" className="h-3.5 w-3.5" />
					</span>
				)}
			</div>

			{/* ── Body ── */}
			<div className="flex-1 space-y-4 p-5">
				{/* Diagnostic card — only once we know it's an error */}
				{!isLoading && log && <DiagnosticCard log={log} />}

				{/* Property table — labels always present */}
				<div className="rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<div className="divide-y divide-stroke-soft-100 px-4 dark:divide-stroke-soft-100/40">
						<PropertyRow label="Status">
							{isLoading ? (
								<PropertyValueSkeleton className="h-[18px] w-14 rounded-md" />
							) : statusProps ? (
								<Badge.Root
									variant="lighter"
									color={
										statusProps.color as "gray" | "blue" | "orange" | "red"
									}
									className="h-[18px] rounded-md px-1.5 font-semibold text-[10px] tracking-normal"
								>
									{statusProps.label}
								</Badge.Root>
							) : (
								<span className="text-text-soft-400 text-xs">—</span>
							)}
						</PropertyRow>

						<PropertyRow label="Request ID">
							{isLoading ? (
								<PropertyValueSkeleton className="w-44 font-mono" />
							) : (
								<PropertyValue value={log?.uuid} mono copyable maxLength={26} />
							)}
						</PropertyRow>

						<PropertyRow label="Time">
							{isLoading ? (
								<PropertyValueSkeleton className="w-40" />
							) : (
								<PropertyValue
									value={
										log?.created_at
											? new Date(log.created_at).toLocaleString()
											: undefined
									}
								/>
							)}
						</PropertyRow>

						<PropertyRow label="IP address">
							{isLoading ? (
								<PropertyValueSkeleton className="w-28" />
							) : (
								<PropertyValue value={ipAddress} mono copyable />
							)}
						</PropertyRow>

						<PropertyRow label="Source">
							{isLoading ? (
								<PropertyValueSkeleton className="w-52" />
							) : (
								<PropertyValue value={userAgent} maxLength={55} />
							)}
						</PropertyRow>

						<PropertyRow label="Origin">
							{isLoading ? (
								<PropertyValueSkeleton className="w-36" />
							) : (
								<PropertyValue value={origin} mono maxLength={50} />
							)}
						</PropertyRow>
					</div>
				</div>

				{/* Same CopyCodeBlock chrome for loading / empty / loaded — no layout swap */}
				<CopyCodeBlock
					code={isLoading ? "" : requestCode}
					lang="json"
					label="Request body"
					loading={isLoading}
					emptyMessage="No request body"
				/>

				<CopyCodeBlock
					code={isLoading ? "" : responseCode}
					lang="json"
					label="Response body"
					loading={isLoading}
					emptyMessage="No response body"
				/>
			</div>
		</div>
	);
}
