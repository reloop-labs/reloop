import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import { DiagnosticCard } from "./diagnostic-card";
import { formatDisplayEndpoint } from "./format-endpoint";
import { useLogDetailQuery } from "./hooks/use-logs-query";

interface LogDetailPanelProps {
	logId: string | null;
}

type BadgeColor =
	| "gray"
	| "blue"
	| "orange"
	| "red"
	| "green"
	| "yellow"
	| "purple"
	| "sky"
	| "pink"
	| "teal";

/** Returns status label and badge color */
const getStatusProps = (
	statusCode: number | null | undefined,
): { label: string; color: BadgeColor } | null => {
	if (!statusCode) return null;

	if (statusCode >= 200 && statusCode < 300) {
		return { label: `${statusCode} OK`, color: "gray" };
	}
	if (statusCode >= 300 && statusCode < 400) {
		return { label: `${statusCode} REDIR`, color: "blue" };
	}
	if (statusCode >= 400 && statusCode < 500) {
		return { label: `${statusCode} ERR`, color: "orange" };
	}
	if (statusCode >= 500) {
		return { label: `${statusCode} ERR`, color: "red" };
	}

	return { label: `${statusCode}`, color: "gray" };
};

const getMethodColorClass = (method: string) => {
	switch (method?.toUpperCase()) {
		case "GET":
			return "text-success-base";
		case "POST":
			return "text-information-base";
		case "PUT":
		case "PATCH":
			return "text-warning-base";
		case "DELETE":
			return "text-error-base";
		case "SMTP":
			return "text-feature-base";
		default:
			return "text-text-sub-600";
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
		<div className="grid grid-cols-[112px_1fr] items-start gap-4 py-2.5 sm:grid-cols-[128px_1fr]">
			<span className="pt-0.5 text-[13px] text-text-sub-600">{label}</span>
			<div className="flex min-w-0 flex-1 items-start gap-1.5 text-left">
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
	link,
}: {
	value: string | null | undefined;
	mono?: boolean;
	copyable?: boolean;
	maxLength?: number;
	link?: boolean;
}) {
	if (!value) return <span className="text-[13px] text-text-soft-400">—</span>;

	const isTruncated = maxLength && value.length > maxLength;
	const display = isTruncated ? `${value.slice(0, maxLength)}…` : value;

	const content = (
		<span
			className={cn(
				"break-all text-[13px] text-text-strong-950",
				mono && "font-mono",
				link && "text-information-base underline-offset-2 hover:underline",
			)}
		>
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
 * Layout mirrors Stripe request logs: method+path header, property list, bodies.
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
	const displayEndpoint = endpoint
		? formatDisplayEndpoint(endpoint)
		: undefined;
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

	const formattedTime = log?.created_at
		? new Date(log.created_at).toLocaleString("en-US", {
				month: "numeric",
				day: "numeric",
				year: "2-digit",
				hour: "numeric",
				minute: "2-digit",
				second: "2-digit",
				hour12: true,
			})
		: undefined;

	return (
		<div className="flex h-full flex-col">
			{/* ── Panel Header — METHOD /path ── */}
			<div className="flex items-start justify-between gap-3 border-stroke-soft-100 border-b px-5 py-4 dark:border-stroke-soft-100/40">
				<div className="min-w-0 flex-1">
					{isLoading ? (
						<div className="flex h-5 items-center gap-1.5">
							<PropertyValueSkeleton className="h-3.5 w-10" />
							<PropertyValueSkeleton className="h-3.5 w-48" />
						</div>
					) : (
						<h2 className="flex min-w-0 items-center font-semibold text-[15px] text-text-strong-950 leading-snug">
							{method && displayEndpoint ? (
								<>
									<span
										className={cn(
											"mr-2 shrink-0 font-bold text-[13px] uppercase tracking-wide",
											getMethodColorClass(method),
										)}
									>
										{method}
									</span>
									<span className="min-w-0 truncate font-medium font-mono text-[13px]">
										{displayEndpoint}
									</span>
								</>
							) : (
								<span className="truncate">{log?.event}</span>
							)}
						</h2>
					)}
				</div>
				{log ? (
					<Link
						href={`/logs/${log.uuid}`}
						className="shrink-0 rounded-lg p-1.5 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
						title="View full details"
					>
						<Icon name="arrows-expand-diagonal" className="h-4 w-4" />
					</Link>
				) : (
					<span className="shrink-0 rounded-lg p-1.5 text-text-soft-400">
						<Icon name="arrows-expand-diagonal" className="h-4 w-4" />
					</span>
				)}
			</div>

			{/* ── Body ── */}
			<div className="flex-1 overflow-y-auto px-5 pb-5">
				{/* Diagnostic card — only once we know it's an error */}
				{!isLoading && log && <DiagnosticCard log={log} />}

				{/* Property table — Stripe-style key/value list */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
					<PropertyRow label="Status">
						{isLoading ? (
							<PropertyValueSkeleton className="h-[22px] w-16 rounded-md" />
						) : statusProps ? (
							<Badge.Root
								variant="lighter"
								color={statusProps.color}
								size="medium"
								className="h-[22px] rounded-md px-1.5 font-medium text-[11px] tracking-normal"
							>
								{statusProps.label}
							</Badge.Root>
						) : (
							<span className="text-[13px] text-text-soft-400">—</span>
						)}
					</PropertyRow>

					<PropertyRow label="ID">
						{isLoading ? (
							<PropertyValueSkeleton className="w-44 font-mono" />
						) : (
							<PropertyValue value={log?.uuid} mono copyable maxLength={28} />
						)}
					</PropertyRow>

					<PropertyRow label="Time">
						{isLoading ? (
							<PropertyValueSkeleton className="w-40" />
						) : (
							<PropertyValue value={formattedTime} />
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
							<PropertyValue value={userAgent} maxLength={72} />
						)}
					</PropertyRow>

					<PropertyRow label="Origin">
						{isLoading ? (
							<PropertyValueSkeleton className="w-36" />
						) : (
							<PropertyValue value={origin} mono maxLength={50} link />
						)}
					</PropertyRow>
				</div>

				{/* Request / response bodies */}
				<div className="space-y-4 border-stroke-soft-100 border-t pt-5 dark:border-stroke-soft-100/40">
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
		</div>
	);
}
