import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import { queryKeys } from "#/lib/query-keys";

dayjs.extend(relativeTime);

/** status icon | code | event | time */
const ROW_GRID = "grid-cols-[20px_auto_minmax(0,1fr)_auto]";

const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [matches, query]);

	return matches;
};

const DeliverySkeleton = () => (
	<div className={cn("grid w-full items-center gap-3 px-4 py-3", ROW_GRID)}>
		<Skeleton className="h-4 w-4 rounded-full" />
		<Skeleton className="h-4 w-8" />
		<Skeleton className="h-4 w-full max-w-[140px]" />
		<Skeleton className="h-4 w-14" />
	</div>
);

function statusIcon(status: string): { name: string; className: string } {
	switch (status) {
		case "success":
			return { name: "check-circle", className: "text-success-base" };
		case "failed":
			return { name: "alert-circle", className: "text-error-base" };
		case "pending":
			return { name: "clock", className: "text-warning-base" };
		case "retrying":
		case "retried":
			return { name: "clock", className: "text-warning-base" };
		default:
			return { name: "circle", className: "text-text-soft-400" };
	}
}

function codeClass(status: number | null, deliveryStatus: string) {
	if (status != null && status >= 200 && status < 300) {
		return "text-success-base";
	}
	if (status != null) {
		return "text-error-base";
	}
	if (deliveryStatus === "success") return "text-success-base";
	if (deliveryStatus === "failed") return "text-error-base";
	if (deliveryStatus === "retrying" || deliveryStatus === "pending") {
		return "text-warning-base";
	}
	return "text-text-sub-600";
}

interface DeliveryAttempt {
	id: string;
	attemptNumber: number;
	status: "pending" | "success" | "failed" | "retrying";
	responseStatus: number | null;
	responseBody: string | null;
	responseHeaders: Record<string, string> | null;
	durationMs: number | null;
	errorMessage: string | null;
	createdAt: string;
	source: "automatic" | "manual";
	retriedAutomatically: boolean;
}

interface Delivery {
	id: string;
	webhookId: string;
	webhookEventId: string | null;
	replayOfDeliveryId?: string | null;
	eventType: string;
	eventData: Record<string, unknown>;
	status: "pending" | "success" | "failed" | "retrying";
	requestUrl: string;
	requestHeaders: Record<string, string> | null;
	requestBody: Record<string, unknown> | null;
	responseStatus: number | null;
	responseBody: string | null;
	responseHeaders: Record<string, string> | null;
	attemptNumber: number;
	maxAttempts: number;
	nextRetryAt: string | null;
	lastAttemptAt: string | null;
	errorMessage: string | null;
	errorDetails: Record<string, unknown> | null;
	completedAt: string | null;
	durationMs?: number | null;
	createdAt: string;
	attempts: DeliveryAttempt[];
}

interface DeliveryListResponse {
	deliveries: Delivery[];
	total: number;
	page: number;
	limit: number;
}

interface DeliveryLogsProps {
	webhookId: string;
}

interface DeliveryDetailProps {
	delivery: Delivery;
	onRetry: (deliveryId: string) => Promise<void>;
	isRetrying?: boolean;
	showCloseButton?: boolean;
	onClose?: () => void;
}

const getStatusProps = (
	statusCode: number | null,
	deliveryStatus: string,
): { label: string; color: "gray" | "blue" | "orange" | "red" | "green" } => {
	if (statusCode != null) {
		if (statusCode >= 200 && statusCode < 300) {
			return { label: `${statusCode}`, color: "green" };
		}
		if (statusCode >= 300 && statusCode < 400) {
			return { label: `${statusCode}`, color: "blue" };
		}
		if (statusCode >= 400 && statusCode < 500) {
			return { label: `${statusCode}`, color: "orange" };
		}
		if (statusCode >= 500) {
			return { label: `${statusCode}`, color: "red" };
		}
	}

	switch (deliveryStatus) {
		case "success":
			return { label: "Succeeded", color: "green" };
		case "failed":
			return { label: "Failed", color: "red" };
		case "pending":
			return { label: "Pending", color: "orange" };
		case "retrying":
		case "retried":
			return { label: "Pending", color: "orange" };
		default:
			return { label: deliveryStatus, color: "gray" };
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
		<div className="grid grid-cols-[140px_1fr] items-start gap-4 py-2.5">
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

function formatAttemptBadge(attempt: DeliveryAttempt): {
	label: string;
	color: "gray" | "blue" | "orange" | "red" | "green";
} {
	if (attempt.status === "pending" || attempt.status === "retrying") {
		return { label: "Pending", color: "orange" };
	}
	if (attempt.responseStatus != null) {
		const s = attempt.responseStatus;
		if (s >= 200 && s < 300) return { label: String(s), color: "green" };
		if (s >= 400 && s < 500) return { label: String(s), color: "orange" };
		if (s >= 500) return { label: String(s), color: "red" };
		return { label: String(s), color: "blue" };
	}
	if (attempt.status === "success") return { label: "OK", color: "green" };
	if (attempt.status === "failed") return { label: "Failed", color: "red" };
	return { label: attempt.status, color: "gray" };
}

function AttemptNote({ attempt }: { attempt: DeliveryAttempt }) {
	if (attempt.source === "manual") {
		return (
			<span className="inline-flex items-center gap-1 text-[12px] text-text-sub-600">
				<Icon name="refresh-cw" className="h-3 w-3" />
				Resent manually
			</span>
		);
	}
	if (attempt.retriedAutomatically) {
		return (
			<span className="inline-flex items-center gap-1 text-[12px] text-text-sub-600">
				<Icon name="refresh-cw" className="h-3 w-3" />
				Retried automatically
			</span>
		);
	}
	return null;
}

/**
 * Stripe-style delivery attempts: scheduled next (if any) on top,
 * then past HTTP attempts newest-first. Retries stay out of the left list.
 */
function DeliveryAttemptsSection({
	delivery,
	onRetry,
	isRetrying,
}: {
	delivery: Delivery;
	onRetry: (deliveryId: string) => Promise<void>;
	isRetrying?: boolean;
}) {
	const showScheduledNext =
		(delivery.status === "retrying" || delivery.status === "pending") &&
		delivery.nextRetryAt &&
		dayjs(delivery.nextRetryAt).isAfter(dayjs());

	const attempts = delivery.attempts ?? [];

	return (
		<div>
			<div className="mb-2 flex items-center justify-between gap-2">
				<h3 className="font-semibold text-sm text-text-strong-950">
					Delivery attempts
				</h3>
				<Button.Root
					size="xsmall"
					variant="neutral"
					mode="stroke"
					disabled={isRetrying}
					onClick={() => void onRetry(delivery.id)}
					className="gap-1.5 rounded-lg"
				>
					<Icon name="refresh-cw" className="h-3.5 w-3.5" />
					{isRetrying ? "Resending…" : "Resend"}
				</Button.Root>
			</div>

			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				{showScheduledNext ? (
					<div className="flex items-center justify-between gap-3 border-stroke-soft-100 border-b px-3 py-2.5 dark:border-stroke-soft-100/40">
						<div className="flex min-w-0 items-center gap-2.5">
							<span className="inline-flex h-6 min-w-10 items-center justify-center rounded-md bg-warning-lighter px-1.5 font-semibold text-[11px] text-warning-base">
								<span className="inline-flex items-center gap-1">
									<Icon name="clock" className="h-3 w-3" />
								</span>
							</span>
							<span className="text-[13px] text-text-strong-950">
								in {dayjs(delivery.nextRetryAt).fromNow(true)}
							</span>
						</div>
						<span className="shrink-0 text-[12px] text-text-sub-600">
							Next automatic retry
						</span>
					</div>
				) : null}

				{attempts.length === 0 && !showScheduledNext ? (
					<div className="px-3 py-6 text-center text-[12px] text-text-sub-600">
						{delivery.status === "pending"
							? "Delivery is queued. Attempts will appear here once the worker runs."
							: "No delivery attempts recorded."}
					</div>
				) : (
					<ul className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
						{attempts.map((attempt) => {
							const badge = formatAttemptBadge(attempt);
							return (
								<li
									key={attempt.id}
									className="flex items-center justify-between gap-3 px-3 py-2.5"
								>
									<div className="flex min-w-0 items-center gap-2.5">
										<span
											className={cn(
												"inline-flex h-6 min-w-10 items-center justify-center rounded-md px-1.5 font-mono font-semibold text-[11px] tabular-nums",
												badge.color === "green" &&
													"bg-success-lighter text-success-base",
												badge.color === "red" &&
													"bg-error-lighter text-error-base",
												badge.color === "orange" &&
													"bg-warning-lighter text-warning-base",
												badge.color === "blue" &&
													"bg-bg-weak-50 text-text-sub-600",
												badge.color === "gray" &&
													"bg-bg-weak-50 text-text-sub-600",
											)}
										>
											{badge.color === "orange" &&
											(attempt.status === "pending" ||
												attempt.status === "retrying") ? (
												<Icon name="clock" className="h-3 w-3" />
											) : badge.color === "red" ||
												attempt.status === "failed" ? (
												<span className="inline-flex items-center gap-0.5">
													<span className="text-[10px]">✕</span>
													{badge.label}
												</span>
											) : (
												badge.label
											)}
										</span>
										<span className="truncate text-[13px] text-text-sub-600 tabular-nums">
											{dayjs(attempt.createdAt).format(
												"MMM D, YYYY, h:mm:ss A",
											)}
										</span>
									</div>
									<div className="shrink-0">
										<AttemptNote attempt={attempt} />
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			{delivery.attemptNumber > 0 ? (
				<p className="mt-2 text-[11px] text-text-soft-400">
					Attempt {delivery.attemptNumber} of {delivery.maxAttempts}
					{delivery.durationMs != null
						? ` · last ${delivery.durationMs}ms`
						: ""}
				</p>
			) : null}
		</div>
	);
}

const DeliveryDetail = ({
	delivery,
	onRetry,
	isRetrying,
	showCloseButton,
	onClose,
}: DeliveryDetailProps) => {
	const statusProps = getStatusProps(delivery.responseStatus, delivery.status);

	const eventPayload = useMemo(() => {
		const body = delivery.requestBody ?? {
			id: delivery.webhookEventId,
			type: delivery.eventType,
			data: delivery.eventData,
		};
		return JSON.stringify(body, null, 2);
	}, [delivery]);

	const selectedAttempt = delivery.attempts?.[0] ?? null;
	const responseBody =
		selectedAttempt?.responseBody ?? delivery.responseBody ?? "";

	let formattedResponse = responseBody;
	try {
		if (
			formattedResponse.trim().startsWith("{") ||
			formattedResponse.trim().startsWith("[")
		) {
			formattedResponse = JSON.stringify(
				JSON.parse(formattedResponse),
				null,
				2,
			);
		}
	} catch {
		// keep raw
	}

	const badgeColor =
		statusProps.color === "green"
			? "green"
			: statusProps.color === "red"
				? "red"
				: statusProps.color === "orange"
					? "orange"
					: statusProps.color === "blue"
						? "blue"
						: "gray";

	return (
		<div className="flex h-full flex-col">
			{/* ── Panel Header ── */}
			<div className="flex items-start justify-between gap-3 border-stroke-soft-200 border-b p-6">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="truncate font-mono font-semibold text-sm text-text-strong-950">
							{delivery.eventType}
						</h2>
						<Badge.Root
							variant="lighter"
							color={badgeColor}
							className="h-[18px] rounded-md px-1.5 font-semibold text-[10px] tracking-normal"
						>
							{delivery.status === "retrying" || delivery.status === "pending"
								? "Pending"
								: statusProps.label}
						</Badge.Root>
					</div>
					{delivery.webhookEventId ? (
						<div className="mt-1 flex items-center gap-1.5 text-text-sub-600 text-xs">
							<span className="font-mono">{delivery.webhookEventId}</span>
							<CopyButton value={delivery.webhookEventId} label="Event ID" />
						</div>
					) : (
						<div className="mt-1 flex items-center gap-1.5 text-text-sub-600 text-xs">
							<span className="font-mono">{delivery.id}</span>
							<CopyButton value={delivery.id} label="Delivery ID" />
						</div>
					)}
				</div>
				{showCloseButton ? (
					<Button.Root
						size="small"
						variant="neutral"
						mode="stroke"
						className="px-2"
						onClick={onClose}
					>
						<Icon name="cross" className="h-4 w-4" />
					</Button.Root>
				) : null}
			</div>

			{/* ── Body ── */}
			<div className="flex-1 space-y-5 overflow-y-auto p-6">
				{/* Event details */}
				<div>
					<h3 className="mb-1 font-semibold text-sm text-text-strong-950">
						Event details
					</h3>
					<div className="rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
						<div className="divide-y divide-stroke-soft-100 px-4 dark:divide-stroke-soft-100/40">
							<PropertyRow label="Origin date">
								<PropertyValue
									value={dayjs(delivery.createdAt).format(
										"MMM D, YYYY, h:mm:ss A",
									)}
								/>
							</PropertyRow>
							<PropertyRow label="Endpoint">
								<PropertyValue
									value={delivery.requestUrl}
									mono
									maxLength={42}
								/>
							</PropertyRow>
							<PropertyRow label="Delivery ID">
								<PropertyValue
									value={delivery.id}
									mono
									copyable
									maxLength={26}
								/>
							</PropertyRow>
							{delivery.nextRetryAt &&
							(delivery.status === "retrying" ||
								delivery.status === "pending") ? (
								<PropertyRow label="Next delivery attempt">
									<PropertyValue
										value={dayjs(delivery.nextRetryAt).format(
											"MMM D, YYYY, h:mm:ss A",
										)}
									/>
								</PropertyRow>
							) : null}
							{delivery.errorMessage ? (
								<PropertyRow label="Last error">
									<span className="text-error-base text-xs">
										{delivery.errorMessage}
									</span>
								</PropertyRow>
							) : null}
						</div>
					</div>
				</div>

				{/* Combined attempts (Stripe-style) */}
				<DeliveryAttemptsSection
					delivery={delivery}
					onRetry={onRetry}
					isRetrying={isRetrying}
				/>

				{/* Event data / request body */}
				{eventPayload ? (
					<div>
						<CopyCodeBlock code={eventPayload} lang="json" label="Event data" />
					</div>
				) : null}

				{/* Latest response body */}
				{formattedResponse ? (
					<div>
						<CopyCodeBlock
							code={formattedResponse}
							lang={
								formattedResponse.trim().startsWith("{") ||
								formattedResponse.trim().startsWith("[")
									? "json"
									: "text"
							}
							label="Latest response body"
						/>
					</div>
				) : null}

				{delivery.requestHeaders &&
				Object.keys(delivery.requestHeaders).length > 0 ? (
					<div>
						<CopyCodeBlock
							code={JSON.stringify(delivery.requestHeaders, null, 2)}
							lang="json"
							label="Request headers"
						/>
					</div>
				) : null}
			</div>
		</div>
	);
};

export const DeliveryLogs = ({ webhookId }: DeliveryLogsProps) => {
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDeliveryId, setSelectedDeliveryId] =
		useQueryState("delivery_id");
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);
	const [retryingId, setRetryingId] = useState<string | null>(null);

	const isMobile = useMediaQuery("(max-width: 1023px)");

	const page = currentPage ?? 1;
	const limit = pageSize ?? 10;
	const status = statusFilter === "all" ? "" : statusFilter;

	const {
		data,
		isPending: isLoading,
		refetch,
	} = useQuery({
		queryKey: [
			...queryKeys.webhooks.deliveries({
				webhookId,
				page,
				limit,
			}),
			status,
		],
		queryFn: async () => {
			const res = await fetch(
				`/api/webhook/v1/${webhookId}/deliveries?page=${page}&limit=${limit}&status=${status}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load deliveries");
			return res.json() as Promise<DeliveryListResponse>;
		},
		enabled: !!webhookId,
		// Refresh while something may still be retrying
		refetchInterval: (query) => {
			const rows = query.state.data?.deliveries ?? [];
			const busy = rows.some(
				(d) => d.status === "pending" || d.status === "retrying",
			);
			return busy ? 4_000 : false;
		},
	});

	const handleRetryDelivery = async (deliveryId: string) => {
		try {
			setRetryingId(deliveryId);
			await axios.post(
				`/api/webhook/deliveries/${deliveryId}/retry`,
				{},
				{ withCredentials: true },
			);
			toast.success("Delivery resend initiated");
			await refetch();
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.data?.message) {
				toast.error(error.response.data.message);
			} else {
				toast.error("Failed to resend delivery");
			}
		} finally {
			setRetryingId(null);
		}
	};

	// Root deliveries only come from the API; still guard against stale replay rows.
	const filteredDeliveries =
		data?.deliveries?.filter((delivery) => {
			if (delivery.replayOfDeliveryId) return false;
			const matchesSearch =
				searchQuery === "" ||
				delivery.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
				delivery.requestUrl.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesSearch;
		}) || [];

	const selectedDelivery = selectedDeliveryId
		? filteredDeliveries.find((d) => d.id === selectedDeliveryId) || null
		: null;

	const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	const listCode = (delivery: Delivery) => {
		if (delivery.status === "retrying" || delivery.status === "pending") {
			return "—";
		}
		return delivery.responseStatus ?? "—";
	};

	return (
		<div className="flex flex-col space-y-4">
			{/* Filters */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="max-w-sm flex-1">
					<Input.Root size="small">
						<Input.Wrapper className="rounded-xl bg-bg-weak-50 px-2.5 dark:bg-bg-weak-50/40">
							<Input.Icon
								as={() => (
									<Icon name="search" className="h-4 w-4 text-text-sub-600" />
								)}
							/>
							<Input.Input
								type="text"
								placeholder="Filter by event type..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="flex w-fit flex-wrap items-center gap-1.5">
					{["all", "success", "failed", "retrying"].map((s) => (
						<button
							key={s}
							type="button"
							className={cn(
								"rounded-full px-3 py-1 font-medium text-[12px] capitalize transition-colors",
								statusFilter === s
									? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
									: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:bg-bg-weak-50/40",
							)}
							onClick={() => {
								setStatusFilter(s);
								setCurrentPage(1);
							}}
						>
							{s === "all"
								? "All"
								: s === "success"
									? "Succeeded"
									: s === "failed"
										? "Failed"
										: "Pending"}
						</button>
					))}
				</div>
			</div>

			{/* ── Split Panel ── */}
			<div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start">
				{/* LEFT — one row per event delivery (no retry rows) */}
				<div
					className={cn(
						"w-full text-paragraph-sm",
						!isMobile && "sticky top-4 flex w-[480px] shrink-0 flex-col",
					)}
					style={!isMobile ? { maxHeight: "calc(100vh - 220px)" } : undefined}
				>
					<div
						className={cn(
							"grid items-center gap-3 rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40",
							ROW_GRID,
						)}
					>
						<div aria-hidden className="w-5" />
						<div className="flex items-center gap-1">
							<Icon name="code" className="h-3 w-3" />
							<span className="text-xs">Code</span>
						</div>
						<div className="flex items-center gap-1">
							<Icon name="activity-2" className="h-3 w-3" />
							<span className="text-xs">Event</span>
						</div>
						<div className="flex items-center justify-end gap-1">
							<Icon name="clock" className="h-3 w-3" />
							<span className="text-xs">Time</span>
						</div>
					</div>

					<div className="-mt-2.5 flex min-h-0 flex-1 flex-col divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
						<div
							className={cn(
								"min-h-0 divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50",
								!isMobile && "flex-1 overflow-y-auto",
							)}
						>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<DeliverySkeleton key={`sk-${i}`} />
								))
							) : filteredDeliveries.length === 0 ? (
								<div className="flex h-32 w-full items-center justify-center text-center text-text-sub-600">
									No deliveries found
								</div>
							) : (
								filteredDeliveries.map((delivery) => {
									const isRowActive = selectedDeliveryId === delivery.id;
									const icon = statusIcon(delivery.status);

									return (
										<button
											key={delivery.id}
											type="button"
											onClick={() => {
												if (selectedDeliveryId === delivery.id) {
													setSelectedDeliveryId(null);
												} else {
													setSelectedDeliveryId(delivery.id);
												}
											}}
											className={cn(
												"group/row grid w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150",
												ROW_GRID,
												"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:bg-bg-weak-50/50",
												isRowActive &&
													"bg-bg-weak-50/80 ring-1 ring-primary-base/30 ring-inset",
											)}
										>
											<Tooltip.Provider delayDuration={200}>
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<span className="flex items-center justify-center">
															<Icon
																name={icon.name}
																className={cn(
																	"h-3.5 w-3.5 shrink-0",
																	icon.className,
																)}
															/>
														</span>
													</Tooltip.Trigger>
													<Tooltip.Content side="top" size="small">
														<span className="capitalize">
															{delivery.status === "retrying"
																? "pending retry"
																: delivery.status}
														</span>
													</Tooltip.Content>
												</Tooltip.Root>
											</Tooltip.Provider>

											<span
												className={cn(
													"font-medium font-mono text-[13px] tabular-nums",
													codeClass(delivery.responseStatus, delivery.status),
												)}
											>
												{listCode(delivery)}
											</span>

											<div className="min-w-0 truncate font-medium font-mono text-label-sm text-text-strong-950">
												{delivery.eventType}
											</div>

											<div className="text-right font-medium text-[13px] text-text-sub-600 tabular-nums">
												{dayjs(delivery.createdAt).format("HH:mm:ss")}
											</div>
										</button>
									);
								})
							)}
						</div>

						{data && data.total > 0 ? (
							<div
								className={cn(
									"flex shrink-0 items-center justify-between px-4",
									isMobile
										? "py-3 text-paragraph-sm text-text-sub-600"
										: "py-2 text-[11px] text-text-sub-600",
								)}
							>
								<div className="flex items-center gap-3">
									<span>
										Showing {startIndex}–{endIndex} of {data.total} event
										{data.total !== 1 ? "s" : ""}
									</span>
									<PageSizeDropdown
										value={pageSize}
										onValueChange={(value) => {
											setPageSize(value);
											setCurrentPage(1);
										}}
									/>
								</div>
								<PaginationControls
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={setCurrentPage}
									isLoading={isLoading}
								/>
							</div>
						) : null}
					</div>
				</div>

				{/* RIGHT — Event detail + combined attempts */}
				{!isMobile && (
					<div className="min-h-[500px] min-w-0 flex-1 rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
						{selectedDelivery ? (
							<DeliveryDetail
								delivery={selectedDelivery}
								onRetry={handleRetryDelivery}
								isRetrying={retryingId === selectedDelivery.id}
							/>
						) : (
							<div className="flex min-h-[500px] flex-col items-center justify-center gap-1 p-8 text-center">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
									<Icon name="search" className="h-5 w-5 text-text-sub-600" />
								</div>
								<h3 className="font-semibold text-base text-text-strong-950">
									Select an event to inspect
								</h3>
								<p className="mx-auto max-w-sm text-balance font-medium text-[12px] text-text-sub-600">
									Click any row on the left to view delivery attempts, event
									data, and responses.
								</p>
							</div>
						)}
					</div>
				)}
			</div>

			<Drawer.Root
				open={isMobile && !!selectedDeliveryId}
				onOpenChange={(open) => !open && setSelectedDeliveryId(null)}
			>
				<Drawer.Content className="w-[600px] max-w-[90vw]">
					<Drawer.Title className="sr-only">Delivery details</Drawer.Title>
					{selectedDelivery ? (
						<DeliveryDetail
							delivery={selectedDelivery}
							onRetry={handleRetryDelivery}
							isRetrying={retryingId === selectedDelivery.id}
							showCloseButton
							onClose={() => setSelectedDeliveryId(null)}
						/>
					) : (
						<div />
					)}
				</Drawer.Content>
			</Drawer.Root>
		</div>
	);
};
