import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import {
	AMBER_KEYCAP,
	GREEN_KEYCAP,
	KeycapBadge,
	type KeycapStyle,
	NEUTRAL_KEYCAP,
	RED_KEYCAP,
} from "#/features/emails/detail/email-status-badge";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { DiagnosticCard } from "./diagnostic-card";
import { formatDisplayEndpoint } from "./format-endpoint";
import { useLogDetailQuery } from "./hooks/use-logs-query";

type StatusTone = "success" | "warning" | "error" | "neutral";

const getStatusTone = (statusCode: number | null | undefined): StatusTone => {
	if (!statusCode) return "neutral";
	if (statusCode >= 500) return "error";
	if (statusCode >= 400) return "warning";
	if (statusCode >= 200 && statusCode < 300) return "success";
	return "neutral";
};

const getStatusLabel = (statusCode: number) => {
	if (statusCode >= 200 && statusCode < 300) return `${statusCode} OK`;
	if (statusCode >= 300 && statusCode < 400) return `${statusCode} Redirect`;
	return `${statusCode} Error`;
};

const STATUS_KEYCAP: Record<StatusTone, KeycapStyle> = {
	success: GREEN_KEYCAP,
	warning: AMBER_KEYCAP,
	error: RED_KEYCAP,
	neutral: NEUTRAL_KEYCAP,
};

/** Same two-layer tile as `CampaignAvatar`, tinted by response status. */
const AVATAR_TONE: Record<StatusTone, { outer: string; icon: string }> = {
	success: {
		outer:
			"border-success-base/25 bg-success-lighter dark:border-success-base/30 dark:bg-success-base/10",
		icon: "text-success-base",
	},
	warning: {
		outer:
			"border-warning-base/25 bg-warning-lighter dark:border-warning-base/30 dark:bg-warning-base/10",
		icon: "text-warning-base",
	},
	error: {
		outer:
			"border-error-base/25 bg-error-lighter dark:border-error-base/30 dark:bg-error-base/10",
		icon: "text-error-base",
	},
	neutral: {
		outer:
			"border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]",
		icon: "text-text-sub-600 dark:text-white/80",
	},
};

function LogAvatar({ tone }: { tone: StatusTone }) {
	return (
		<div
			className={cn(
				"flex size-12 shrink-0 items-center justify-center rounded-[14px] border p-0.5",
				AVATAR_TONE[tone].outer,
			)}
		>
			<div className="flex h-full w-full items-center justify-center rounded-[11px] bg-bg-white-0 shadow-xs dark:bg-[#0c0c0c]">
				<Icon name="logs" className={cn("size-5", AVATAR_TONE[tone].icon)} />
			</div>
		</div>
	);
}

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
			onClick={() => void handleCopy()}
			className="rounded p-0.5 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
			title={`Copy ${label || "value"}`}
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("h-3.5 w-3.5", copied && "text-success-base")}
			/>
		</button>
	);
}

/** Label/value row, same rhythm as the email detail header fields. */
function FieldRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-start gap-4">
			<span className="w-24 shrink-0 font-medium text-paragraph-sm text-text-sub-600">
				{label}
			</span>
			<div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
		</div>
	);
}

function FieldValue({
	value,
	mono,
	copyable,
	copyLabel,
	maxLength,
}: {
	value: string | null | undefined;
	mono?: boolean;
	copyable?: boolean;
	copyLabel?: string;
	maxLength?: number;
}) {
	if (!value) {
		return (
			<span className="font-medium text-paragraph-sm text-text-soft-400">
				-
			</span>
		);
	}
	const isTruncated = maxLength && value.length > maxLength;
	const display = isTruncated ? `${value.slice(0, maxLength)}…` : value;
	const content = (
		<span
			className={cn(
				"truncate font-medium text-paragraph-sm text-text-strong-950",
				mono && "font-mono text-[13px]",
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
			{copyable && <CopyButton value={value} label={copyLabel} />}
		</>
	);
}

function LogDetailSkeleton() {
	return (
		<>
			<div className="mb-8 flex items-center gap-4">
				<Skeleton className="size-12 shrink-0 rounded-[14px]" />
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<Skeleton className="h-4 w-20 rounded-full" />
					<Skeleton className="h-6 w-72 rounded-lg" />
				</div>
				<Skeleton className="h-9 w-36 rounded-xl" />
			</div>
			<div className="space-y-3.5">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="flex gap-4">
						<Skeleton className="h-4 w-24 rounded-md" />
						<Skeleton className="h-4 w-56 rounded-md" />
					</div>
				))}
			</div>
			<Skeleton className="mt-8 h-40 rounded-xl" />
		</>
	);
}

export function LogDetailPage({ logId }: { logId: string }) {
	const { data: logData, error, isPending } = useLogDetailQuery(logId);

	return (
		<div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
			<div className="pb-8 max-md:hidden">
				<AnimatedBackButton fallbackHref="/logs" />
			</div>
			{isPending ? (
				<LogDetailSkeleton />
			) : error || !logData ? (
				<LogNotFound />
			) : (
				<LogDetailContent log={logData} />
			)}
		</div>
	);
}

function LogNotFound() {
	return (
		<div>
			<div className="flex items-center gap-1.5 text-error-base">
				<Icon name="alert-circle" className="h-3.5 w-3.5" />
				<p className="font-medium text-paragraph-xs">Not found</p>
			</div>
			<h1 className="mt-1 font-medium text-title-h6 leading-8">
				Log not found
			</h1>
			<p className="mt-1 text-paragraph-sm text-text-sub-600">
				This log doesn't exist or is no longer retained.
			</p>
		</div>
	);
}

function LogDetailContent({
	log,
}: {
	log: NonNullable<ReturnType<typeof useLogDetailQuery>["data"]>;
}) {
	const [idCopied, setIdCopied] = useState(false);

	const method = log.requestDetails?.method as string | undefined;
	const endpoint = log.requestDetails?.endpoint as string | undefined;
	const displayEndpoint = endpoint
		? formatDisplayEndpoint(endpoint)
		: undefined;
	const tone = getStatusTone(log.status_code);
	const hasRequestDetails =
		log.requestDetails && Object.keys(log.requestDetails).length > 0;
	const metadataEntries = log.metadata ? Object.entries(log.metadata) : [];

	let origin: string | undefined;
	if (endpoint) {
		try {
			origin = new URL(endpoint).origin;
		} catch {
			origin = undefined;
		}
	}

	const handleCopyId = async () => {
		try {
			await navigator.clipboard.writeText(log.uuid);
			setIdCopied(true);
			toast.success("Request ID copied");
			setTimeout(() => setIdCopied(false), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	};

	return (
		<>
			{/* Avatar + endpoint + status + actions row (mirrors campaign/email headers) */}
			<div className="mb-8 flex items-center gap-4">
				<LogAvatar tone={tone} />
				<div className="min-w-0 flex-1">
					<p className="font-medium text-paragraph-xs text-text-sub-600">
						{method ? `${method.toUpperCase()} request` : "Log"}
					</p>
					<div className="flex min-w-0 items-center gap-2.5">
						<h1 className="min-w-0 truncate font-semibold text-title-h6 leading-7">
							{displayEndpoint ?? log.event}
						</h1>
						{log.status_code ? (
							<KeycapBadge
								style={STATUS_KEYCAP[tone]}
								label={getStatusLabel(log.status_code)}
							/>
						) : null}
					</div>
				</div>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					className="shrink-0 gap-1.5"
					onClick={() => void handleCopyId()}
				>
					<Icon name={idCopied ? "check" : "copy"} className="h-4 w-4" />
					<span>Copy request ID</span>
				</Button.Root>
			</div>

			<div className="space-y-8">
				<section className="flex flex-col gap-3.5">
					{method && (
						<FieldRow label="Method">
							<FieldValue value={method.toUpperCase()} mono />
						</FieldRow>
					)}
					{displayEndpoint && (
						<FieldRow label="Endpoint">
							<FieldValue value={displayEndpoint} mono maxLength={80} />
						</FieldRow>
					)}
					<FieldRow label="Request ID">
						<FieldValue value={log.uuid} mono copyable copyLabel="Request ID" />
					</FieldRow>
					<FieldRow label="Time">
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{new Date(log.created_at).toLocaleString(undefined, {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
							})}
						</span>
						<span className="text-paragraph-sm text-text-soft-400">
							· {formatRelativeTime(log.created_at)}
						</span>
					</FieldRow>
					{hasRequestDetails && log.requestDetails.ipAddress ? (
						<FieldRow label="IP address">
							<FieldValue
								value={log.requestDetails.ipAddress as string}
								mono
								copyable
								copyLabel="IP address"
							/>
						</FieldRow>
					) : null}
					{log.trace_id && (
						<FieldRow label="Trace ID">
							<FieldValue
								value={log.trace_id}
								mono
								copyable
								copyLabel="Trace ID"
							/>
						</FieldRow>
					)}
					{hasRequestDetails && log.requestDetails.userAgent ? (
						<FieldRow label="Source">
							<FieldValue
								value={log.requestDetails.userAgent as string}
								maxLength={80}
							/>
						</FieldRow>
					) : null}
					{origin && (
						<FieldRow label="Origin">
							<FieldValue value={origin} mono />
						</FieldRow>
					)}
				</section>

				<DiagnosticCard log={log} />

				{log.request_body && Object.keys(log.request_body).length > 0 && (
					<CopyCodeBlock
						code={JSON.stringify(log.request_body, null, 2)}
						lang="json"
						label="Request body"
						collapsedHeight={240}
					/>
				)}

				{metadataEntries.length > 0 ? (
					<CopyCodeBlock
						code={JSON.stringify(log.metadata, null, 2)}
						lang="json"
						label="Response body"
						collapsedHeight={240}
					/>
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
		</>
	);
}
