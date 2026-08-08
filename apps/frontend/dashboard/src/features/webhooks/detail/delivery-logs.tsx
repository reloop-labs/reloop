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

/**
 * User-facing delivery outcome — never raw HTTP codes.
 * success → Delivered · pending/retrying → Pending · failed → Error
 */
function deliveryOutcomeLabel(
	status: string,
): "Delivered" | "Pending" | "Error" {
	switch (status) {
		case "success":
			return "Delivered";
		case "pending":
		case "retrying":
		case "retried":
			return "Pending";
		default:
			return "Error";
	}
}

function statusIcon(status: string): { name: string; className: string } {
	switch (deliveryOutcomeLabel(status)) {
		case "Delivered":
			return { name: "check-circle", className: "text-success-base" };
		case "Error":
			return { name: "alert-circle", className: "text-error-base" };
		case "Pending":
			return status === "retrying" || status === "retried"
				? { name: "rotate-cw", className: "text-warning-base" }
				: { name: "clock", className: "text-warning-base" };
		default:
			return { name: "circle", className: "text-text-soft-400" };
	}
}

function outcomeLabelClass(status: string) {
	switch (deliveryOutcomeLabel(status)) {
		case "Delivered":
			return "text-success-base";
		case "Error":
			return "text-error-base";
		case "Pending":
			return "text-warning-base";
		default:
			return "text-text-sub-600";
	}
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
		<div className="grid grid-cols-[148px_1fr] items-start gap-6 py-2">
			<span className="pt-px text-[13px] text-text-sub-600">{label}</span>
			<div className="min-w-0 text-left text-[13px] text-text-strong-950">
				{children}
			</div>
		</div>
	);
}

/** Short human summary for the event data, Stripe-style "Description". */
function describeEvent(
	eventType: string,
	data: Record<string, unknown> | null | undefined,
	errorMessage: string | null,
): string | null {
	if (!data || typeof data !== "object") {
		return errorMessage;
	}
	if (eventType.startsWith("domain.")) {
		const name =
			(typeof data.name === "string" && data.name) ||
			(typeof data.domain === "string" && data.domain) ||
			null;
		if (name) {
			const status = typeof data.status === "string" ? data.status : null;
			return status ? `${name} (${status})` : name;
		}
	}
	if (eventType.startsWith("email.")) {
		const subject = typeof data.subject === "string" ? data.subject : null;
		const to = Array.isArray(data.to)
			? data.to.filter((t): t is string => typeof t === "string").join(", ")
			: typeof data.to === "string"
				? data.to
				: null;
		if (subject && to) return `${subject} → ${to}`;
		if (subject) return subject;
		if (to) return to;
	}
	if (eventType.startsWith("contact.")) {
		const email = typeof data.email === "string" ? data.email : null;
		const name = [data.first_name, data.last_name]
			.filter((p): p is string => typeof p === "string" && p.length > 0)
			.join(" ");
		if (email && name) return `${name} <${email}>`;
		if (email) return email;
	}
	if (eventType.startsWith("api-key.") && typeof data.api_key_id === "string") {
		return data.api_key_id;
	}
	return errorMessage;
}

function statusBadgePresentation(delivery: Delivery): {
	label: string;
	icon: string | null;
	className: string;
	/** Optional HTTP detail for tooltip only — never the primary label. */
	httpHint: string | null;
} {
	const label = deliveryOutcomeLabel(delivery.status);
	const httpHint =
		delivery.responseStatus != null ? `HTTP ${delivery.responseStatus}` : null;

	if (label === "Pending") {
		return {
			label: "Pending",
			icon: delivery.status === "retrying" ? "rotate-cw" : "clock",
			className: "bg-warning-lighter text-warning-base",
			httpHint,
		};
	}
	if (label === "Delivered") {
		return {
			label: "Delivered",
			icon: "check-circle",
			className: "bg-success-lighter text-success-base",
			httpHint,
		};
	}
	return {
		label: "Error",
		icon: "alert-circle",
		className: "bg-error-lighter text-error-base",
		httpHint,
	};
}

/**
 * Parse an HTTP status code from attempt fields or error text (e.g. "HTTP 405: …").
 */
function resolveAttemptStatusCode(attempt: DeliveryAttempt): number | null {
	if (
		attempt.responseStatus != null &&
		Number.isFinite(attempt.responseStatus)
	) {
		return attempt.responseStatus;
	}
	const msg = attempt.errorMessage ?? "";
	const match =
		msg.match(/\bHTTP\s+(\d{3})\b/i) ?? msg.match(/\b([1-5]\d{2})\b/);
	if (match?.[1]) {
		const n = Number(match[1]);
		if (n >= 100 && n <= 599) return n;
	}
	return null;
}

/**
 * Compact attempt chip (Stripe-style).
 * Always show the HTTP status code when known.
 * Failed → red "✕ 403" · Success → green "✓ 200" · Pending → clock
 */
function AttemptStatusChip({
	attempt,
	fallbackCode,
}: {
	attempt: DeliveryAttempt;
	/** Parent delivery.responseStatus when the attempt row omitted it. */
	fallbackCode?: number | null;
}) {
	const code = resolveAttemptStatusCode(attempt) ?? fallbackCode ?? null;
	const outcome = deliveryOutcomeLabel(attempt.status);
	const isSuccess =
		outcome === "Delivered" ||
		attempt.status === "success" ||
		(code != null && code >= 200 && code < 300);
	const isPending =
		attempt.status === "pending" || attempt.status === "retrying";

	if (isPending) {
		return (
			<span className="inline-flex h-6 w-8 shrink-0 items-center justify-center rounded-md bg-warning-lighter text-warning-base">
				<Icon
					name={attempt.status === "retrying" ? "rotate-cw" : "clock"}
					className="h-3.5 w-3.5"
				/>
			</span>
		);
	}

	if (isSuccess) {
		return (
			<span className="inline-flex h-6 min-w-10 shrink-0 items-center justify-center gap-0.5 rounded-md bg-success-lighter px-1.5 font-medium font-mono text-[11px] text-success-base tabular-nums">
				{code != null ? (
					code
				) : (
					<>
						<Icon name="check" className="h-3 w-3" />
						OK
					</>
				)}
			</span>
		);
	}

	// Failed / error — always show the status code (parsed from body when needed)
	return (
		<span
			className="inline-flex h-6 min-w-10 shrink-0 items-center justify-center gap-0.5 rounded-md bg-error-lighter px-1.5 font-medium font-mono text-[11px] text-error-base tabular-nums"
			title={attempt.errorMessage ?? undefined}
		>
			<span className="text-[10px] leading-none" aria-hidden>
				✕
			</span>
			{code != null ? code : "ERR"}
		</span>
	);
}

function AttemptNote({ attempt }: { attempt: DeliveryAttempt }) {
	if (attempt.source === "manual") {
		return (
			<span className="inline-flex items-center gap-1.5 text-[13px] text-text-sub-600">
				<Icon name="rotate-cw" className="h-3.5 w-3.5 shrink-0" />
				Resent manually
			</span>
		);
	}
	if (attempt.retriedAutomatically) {
		return (
			<span className="inline-flex items-center gap-1.5 text-[13px] text-text-sub-600">
				<Icon name="rotate-cw" className="h-3.5 w-3.5 shrink-0" />
				Retried automatically
			</span>
		);
	}
	return null;
}

/**
 * Stripe-style delivery attempts list:
 * next retry on top → past attempts with ✕ code + timestamp + auto-retry note.
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
	const hasRows = showScheduledNext || attempts.length > 0;

	return (
		<div>
			{/* Title row — Resend sits on the right like Stripe */}
			<div className="mb-3 flex items-center justify-between gap-3">
				<h3 className="font-medium text-[13px] text-text-sub-600">
					Delivery attempts
				</h3>
				<Button.Root
					size="xsmall"
					variant="neutral"
					mode="stroke"
					disabled={isRetrying}
					onClick={() => void onRetry(delivery.id)}
					className="h-7 shrink-0 rounded-lg px-2.5 font-medium text-[12px]"
				>
					{isRetrying ? "Resending…" : "Resend"}
				</Button.Root>
			</div>

			{!hasRows ? (
				<p className="py-4 text-center text-[12px] text-text-sub-600">
					{delivery.status === "pending"
						? "Delivery is queued. Attempts will appear here once the worker runs."
						: "No delivery attempts recorded."}
				</p>
			) : (
				<ul className="flex flex-col gap-3">
					{/* Next scheduled retry */}
					{showScheduledNext && delivery.nextRetryAt ? (
						<li className="flex items-center gap-3">
							<span className="inline-flex h-6 w-8 shrink-0 items-center justify-center rounded-md bg-warning-lighter text-warning-base">
								<Icon name="clock" className="h-3.5 w-3.5" />
							</span>
							<span className="text-[13px] text-text-strong-950">
								in {dayjs(delivery.nextRetryAt).fromNow(true)}
							</span>
						</li>
					) : null}

					{/* Past attempts — newest first */}
					{attempts.map((attempt, index) => (
						<li
							key={attempt.id}
							className="flex items-center justify-between gap-3"
						>
							<div className="flex min-w-0 items-center gap-3">
								<AttemptStatusChip
									attempt={attempt}
									// Newest attempt often mirrors the delivery's last response
									fallbackCode={index === 0 ? delivery.responseStatus : null}
								/>
								<span className="truncate text-[13px] text-text-sub-600 tabular-nums">
									{dayjs(attempt.createdAt).format("MMM D, YYYY, h:mm:ss A")}
								</span>
							</div>
							<div className="shrink-0">
								<AttemptNote attempt={attempt} />
							</div>
						</li>
					))}
				</ul>
			)}
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

	const eventId = delivery.webhookEventId || delivery.id;
	const badge = statusBadgePresentation(delivery);
	const description = describeEvent(
		delivery.eventType,
		delivery.eventData,
		delivery.errorMessage,
	);
	const showNextAttempt =
		Boolean(delivery.nextRetryAt) &&
		(delivery.status === "retrying" || delivery.status === "pending");

	return (
		<div className="flex h-full flex-col">
			{/* ── Top fold (Stripe-style event details) ── */}
			<div className="border-stroke-soft-200 border-b px-6 pt-5 pb-5">
				{/* Section title + event id */}
				<div className="flex items-start justify-between gap-3">
					<p className="font-medium text-[13px] text-text-sub-600">
						Event details
					</p>
					<div className="flex min-w-0 items-center gap-1.5">
						<span className="truncate font-mono text-[12px] text-text-sub-600">
							{eventId}
						</span>
						<CopyButton value={eventId} label="Event ID" />
						{showCloseButton ? (
							<button
								type="button"
								onClick={onClose}
								className="ml-0.5 rounded p-0.5 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
								aria-label="Close"
							>
								<Icon name="cross" className="h-3.5 w-3.5" />
							</button>
						) : null}
					</div>
				</div>

				{/* Event type + status badge */}
				<div className="mt-2 flex flex-wrap items-center gap-2">
					<h2 className="font-mono font-semibold text-[18px] text-text-strong-950 leading-tight tracking-tight">
						{delivery.eventType}
					</h2>
					<span
						title={badge.httpHint ?? undefined}
						className={cn(
							"inline-flex h-[22px] items-center gap-1 rounded-full px-2 font-medium text-[11px]",
							badge.className,
						)}
					>
						{badge.icon ? (
							<Icon name={badge.icon} className="h-3 w-3 shrink-0" />
						) : null}
						{badge.label}
					</span>
				</div>

				{/* Flat meta rows */}
				<div className="mt-4 space-y-0.5">
					<PropertyRow label="Origin date">
						{dayjs(delivery.createdAt).format("MMM D, YYYY, h:mm:ss A")}
					</PropertyRow>
					<PropertyRow label="Source">
						<span className="font-medium text-primary-base">Dashboard</span>
					</PropertyRow>
					<PropertyRow label="API version">
						<span className="font-mono text-text-sub-600">2026-04-03</span>
					</PropertyRow>
					{description ? (
						<PropertyRow label="Description">
							<span className="whitespace-pre-wrap break-words text-text-sub-600">
								{description}
							</span>
						</PropertyRow>
					) : null}
					{showNextAttempt && delivery.nextRetryAt ? (
						<PropertyRow label="Next delivery attempt">
							{dayjs(delivery.nextRetryAt).format("MMM D, YYYY, h:mm:ss A")}
						</PropertyRow>
					) : null}
				</div>
			</div>

			{/* ── Body ── */}
			<div className="flex-1 space-y-5 overflow-y-auto p-6">
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
									? "Delivered"
									: s === "failed"
										? "Error"
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
							<Icon name="activity" className="h-3 w-3" />
							<span className="text-xs">Status</span>
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
														<span>
															{deliveryOutcomeLabel(delivery.status)}
															{delivery.responseStatus != null
																? ` · HTTP ${delivery.responseStatus}`
																: ""}
														</span>
													</Tooltip.Content>
												</Tooltip.Root>
											</Tooltip.Provider>

											<span
												className={cn(
													"font-medium text-[13px]",
													outcomeLabelClass(delivery.status),
												)}
												title={
													delivery.responseStatus != null
														? `HTTP ${delivery.responseStatus}`
														: undefined
												}
											>
												{deliveryOutcomeLabel(delivery.status)}
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
