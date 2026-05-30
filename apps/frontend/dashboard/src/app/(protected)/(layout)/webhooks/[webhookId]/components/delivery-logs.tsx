import { CopyCodeBlock } from "@fe/dashboard/app/(protected)/onboarding/steps/generate-api-key/components/copy-code-block";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

dayjs.extend(relativeTime);

const GRID = "grid-cols-[100px_100px_1fr_120px_100px_80px]";
const SPLIT_GRID = "grid-cols-[72px_76px_minmax(0,1fr)_50px]";

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

const DeliverySkeleton = ({ isMobile }: { isMobile: boolean }) => (
	<div
		className={cn(
			"grid w-full items-center gap-4 px-4 py-3",
			isMobile ? GRID : SPLIT_GRID,
		)}
	>
		<Skeleton className="h-4 w-16" />
		<Skeleton className="h-5 w-16 rounded-[4px]" />
		<Skeleton className="h-4 w-full" />
		{isMobile && (
			<>
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-4 w-12" />
			</>
		)}
		<Skeleton className="h-4 w-8" />
	</div>
);

const getStatusColorClass = (status: string) => {
	switch (status) {
		case "success":
			return "text-success-base bg-success-lighter";
		case "failed":
			return "text-error-base bg-error-lighter";
		case "pending":
			return "text-warning-base bg-warning-lighter";
		case "retrying":
		case "retried":
			return "text-warning-base bg-warning-lighter";
		default:
			return "text-text-sub-600 bg-bg-weak-50";
	}
};

interface Delivery {
	id: string;
	webhookId: string;
	webhookEventId: string | null;
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
	createdAt: string;
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
	showCloseButton?: boolean;
	onClose?: () => void;
}

const getStatusProps = (
	statusCode: number | null,
	deliveryStatus: string,
): { label: string; color: "gray" | "blue" | "orange" | "red" } => {
	if (statusCode) {
		let label = `${statusCode}`;
		let color: "gray" | "blue" | "orange" | "red" = "gray";

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
	}

	switch (deliveryStatus) {
		case "success":
			return { label: "SUCCESS", color: "gray" };
		case "failed":
			return { label: "FAILED", color: "red" };
		case "pending":
			return { label: "PENDING", color: "orange" };
		case "retrying":
		case "retried":
			return { label: "RETRYING", color: "orange" };
		default:
			return { label: deliveryStatus.toUpperCase(), color: "gray" };
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

const DeliveryDetail = ({
	delivery,
	onRetry,
	showCloseButton,
	onClose,
}: DeliveryDetailProps) => {
	const statusProps = getStatusProps(delivery.responseStatus, delivery.status);
	const duration = delivery.completedAt
		? dayjs(delivery.completedAt).diff(dayjs(delivery.createdAt), "ms")
		: null;

	let formattedResponse = delivery.responseBody || "";
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
	} catch {}

	return (
		<div className="flex h-full flex-col">
			{/* ── Panel Header ── */}
			<div className="flex items-start justify-between gap-3 border-stroke-soft-200 border-b p-6">
				<div className="min-w-0 flex-1">
					<h2 className="truncate font-semibold text-sm text-text-strong-950">
						<span className="mr-1.5 font-bold text-blue-700 uppercase dark:text-blue-400">
							POST
						</span>
						<span>{delivery.requestUrl}</span>
					</h2>
					<div className="mt-1 flex items-center gap-2 text-text-sub-600 text-xs">
						<span>
							{dayjs(delivery.createdAt).format("DD/MM/YYYY, HH:mm:ss")}
						</span>
						<span className="text-text-disabled-300">·</span>
						<span>{dayjs(delivery.createdAt).fromNow()}</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button.Root
						size="small"
						variant="neutral"
						mode="stroke"
						onClick={() => onRetry(delivery.id)}
					>
						<Icon name="refresh-cw" className="mr-2 h-4 w-4" />
						Resend
					</Button.Root>
					{showCloseButton && (
						<Button.Root
							size="small"
							variant="neutral"
							mode="stroke"
							className="px-2"
							onClick={onClose}
						>
							<Icon name="cross" className="h-4 w-4" />
						</Button.Root>
					)}
				</div>
			</div>

			{/* ── Body ── */}
			<div className="flex-1 space-y-4 overflow-y-auto p-6">
				{/* Property table */}
				<div className="rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<div className="divide-y divide-stroke-soft-100 px-4 dark:divide-stroke-soft-100/40">
						<PropertyRow label="Status">
							<Badge.Root
								variant="lighter"
								color={statusProps.color}
								className="h-[18px] rounded-md px-1.5 font-semibold text-[10px] tracking-normal"
							>
								{statusProps.label}
							</Badge.Root>
						</PropertyRow>

						<PropertyRow label="Delivery ID">
							<PropertyValue value={delivery.id} mono copyable maxLength={26} />
						</PropertyRow>

						{delivery.webhookEventId && (
							<PropertyRow label="Event ID">
								<PropertyValue
									value={delivery.webhookEventId}
									mono
									copyable
									maxLength={26}
								/>
							</PropertyRow>
						)}

						<PropertyRow label="Event Type">
							<PropertyValue value={delivery.eventType} />
						</PropertyRow>

						<PropertyRow label="Attempt">
							<PropertyValue
								value={`${delivery.attemptNumber} of ${delivery.maxAttempts}`}
							/>
						</PropertyRow>

						<PropertyRow label="API Version">
							<PropertyValue value="2026-04-03" />
						</PropertyRow>

						<PropertyRow label="Time">
							<PropertyValue
								value={dayjs(delivery.createdAt).format("DD/MM/YYYY, HH:mm:ss")}
							/>
						</PropertyRow>

						{duration !== null && (
							<PropertyRow label="Duration">
								<PropertyValue value={`${duration}ms`} />
							</PropertyRow>
						)}
					</div>
				</div>

				{/* Request Body */}
				{delivery.requestBody &&
					Object.keys(delivery.requestBody).length > 0 && (
						<div>
							<CopyCodeBlock
								code={JSON.stringify(delivery.requestBody, null, 2)}
								lang="json"
								label="Request body"
							/>
						</div>
					)}

				{/* Request Headers */}
				{delivery.requestHeaders &&
					Object.keys(delivery.requestHeaders).length > 0 && (
						<div>
							<CopyCodeBlock
								code={JSON.stringify(delivery.requestHeaders, null, 2)}
								lang="json"
								label="Request headers"
							/>
						</div>
					)}

				{/* Response Body */}
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

				{/* Response Headers */}
				{delivery.responseHeaders &&
					Object.keys(delivery.responseHeaders).length > 0 && (
						<div>
							<CopyCodeBlock
								code={JSON.stringify(delivery.responseHeaders, null, 2)}
								lang="json"
								label="Response headers"
							/>
						</div>
					)}
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

	const isMobile = useMediaQuery("(max-width: 1023px)");

	const { data, isLoading } = useSWR<DeliveryListResponse>(
		`/api/webhook/v1/${webhookId}/deliveries?page=${currentPage}&limit=${pageSize}&status=${statusFilter === "all" ? "" : statusFilter}`,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		},
	);

	const handleRetryDelivery = async (deliveryId: string) => {
		try {
			await axios.post(
				`/api/webhook/deliveries/${deliveryId}/retry`,
				{},
				{
					headers: { credentials: "include" },
				},
			);
			toast.success("Delivery retry initiated");
			await mutate(
				`/api/webhook/v1/${webhookId}/deliveries?page=${currentPage}&limit=${pageSize}&status=${statusFilter === "all" ? "" : statusFilter}`,
			);
		} catch {
			toast.error("Failed to retry delivery");
		}
	};

	const filteredDeliveries =
		data?.deliveries?.filter((delivery) => {
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
		<div className="flex flex-col space-y-6">
			{/* Filters */}
			<div className="flex items-center justify-between gap-4">
				<div className="max-w-sm flex-1">
					<Input.Root size="small">
						<Input.Wrapper className="rounded-2xl border-0 bg-transparent px-2 focus-within:ring-0">
							<Input.Icon
								as={() => (
									<Icon name="search" className="h-4 w-4 text-text-sub-600" />
								)}
							/>
							<Input.Input
								type="text"
								placeholder="Filter by event, status, ID..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="flex w-fit items-center gap-2">
					{["all", "success", "failed", "retrying"].map((status) => (
						<Button.Root
							key={status}
							size="xsmall"
							mode="stroke"
							variant="neutral"
							className={cn(
								"rounded-full px-4 font-medium capitalize transition-colors duration-200",
								statusFilter === status
									? "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950"
									: "border-transparent text-text-sub-600 hover:border-stroke-soft-200 hover:text-text-strong-950",
							)}
							onClick={() => setStatusFilter(status)}
						>
							{status === "all"
								? "All"
								: status === "success"
									? "Succeeded"
									: status === "failed"
										? "Failed"
										: "Retried"}
						</Button.Root>
					))}
				</div>
			</div>

			{/* ── Split Panel ── */}
			<div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start">
				{/* LEFT — Delivery logs list */}
				<div
					className={cn(
						"w-full text-paragraph-sm",
						!isMobile &&
							"sticky top-4 max-h-[calc(100vh-100px)] w-[480px] shrink-0 overflow-y-auto",
					)}
				>
					<div
						className={cn(
							"grid items-center gap-4 rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l px-4 pt-2.5 pb-5 text-text-sub-600 dark:border-stroke-soft-100/50",
							isMobile ? GRID : SPLIT_GRID,
						)}
					>
						<div className="flex items-center gap-2 text-xs">
							<Icon name="clock" className="h-3.5 w-3.5" />
							<span className="font-medium">Time</span>
						</div>
						<div className="flex items-center gap-2 text-xs">
							<Icon name="check-circle" className="h-3.5 w-3.5" />
							<span className="font-medium">Status</span>
						</div>
						<div className="flex items-center gap-2 text-xs">
							<Icon name="activity-2" className="h-3.5 w-3.5" />
							<span className="font-medium">Event</span>
						</div>
						{isMobile && (
							<>
								<div className="flex items-center gap-2 whitespace-nowrap text-xs">
									<Icon name="hash" className="h-3.5 w-3.5" />
									<span className="font-medium">Delivery ID</span>
								</div>
								<div className="flex items-center gap-2 text-xs">
									<Icon name="clock" className="h-3.5 w-3.5" />
									<span className="font-medium">Duration</span>
								</div>
							</>
						)}
						<div className="flex items-center gap-2 text-xs">
							<Icon name="code" className="h-3.5 w-3.5" />
							<span className="font-medium">Code</span>
						</div>
					</div>
					<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<DeliverySkeleton key={i} isMobile={isMobile} />
							))
						) : filteredDeliveries.length === 0 ? (
							<div className="flex h-32 w-full items-center justify-center text-center text-text-sub-600">
								No deliveries found
							</div>
						) : (
							filteredDeliveries.map((delivery) => {
								const duration = delivery.completedAt
									? dayjs(delivery.completedAt).diff(
											dayjs(delivery.createdAt),
											"ms",
										)
									: null;
								const isRowActive = selectedDeliveryId === delivery.id;

								return (
									<div
										key={delivery.id}
										onClick={() => {
											if (selectedDeliveryId === delivery.id) {
												setSelectedDeliveryId(null);
											} else {
												setSelectedDeliveryId(delivery.id);
											}
										}}
										className={cn(
											"group/row grid w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition-colors",
											isMobile ? GRID : SPLIT_GRID,
											"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
											isRowActive && "bg-bg-weak-50/50",
										)}
									>
										<div className="font-medium font-mono text-[13px] text-text-strong-950">
											{dayjs(delivery.createdAt).format("HH:mm:ss")}
										</div>
										<div className="flex items-center">
											<span
												className={cn(
													"inline-flex rounded-md border-[1px] border-transparent px-[6px] py-0.5 font-medium text-[10px]",
													getStatusColorClass(delivery.status),
												)}
											>
												{delivery.status}
											</span>
										</div>
										<div className="truncate font-medium font-mono text-[13px] text-text-strong-950">
											{delivery.eventType}
										</div>
										{isMobile && (
											<>
												<div className="truncate font-mono text-text-sub-600 text-xs">
													{delivery.id.replace("dlv_", "").substring(0, 8)}
												</div>
												<div className="font-medium text-[13px] text-text-sub-600">
													{duration ? `${duration.toLocaleString()}ms` : "---"}
												</div>
											</>
										)}
										<div className="flex items-center">
											<span
												className={cn(
													"font-medium font-mono text-[13px]",
													delivery.responseStatus &&
														delivery.responseStatus >= 200 &&
														delivery.responseStatus < 300
														? "text-success-base"
														: "text-error-base",
												)}
											>
												{delivery.responseStatus || "---"}
											</span>
										</div>
									</div>
								);
							})
						)}

						{/* Pagination footer */}
						{data && data.total > 0 && (
							<div
								className={cn(
									"flex items-center justify-between bg-bg-white-0 px-4",
									isMobile
										? "py-3 text-paragraph-sm text-text-sub-600"
										: "py-2 text-[11px] text-text-sub-600",
								)}
							>
								<div className="flex items-center gap-3">
									<span>
										Showing {startIndex}–{endIndex} of {data.total} deliver
										{data.total !== 1 ? "ies" : "y"}
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
						)}
					</div>
				</div>

				{/* RIGHT — Inline detail panel (Desktop only) */}
				{!isMobile && (
					<div className="min-h-[500px] min-w-0 flex-1 rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
						{selectedDelivery ? (
							<DeliveryDetail
								delivery={selectedDelivery}
								onRetry={handleRetryDelivery}
							/>
						) : (
							<div className="flex min-h-[500px] flex-col items-center justify-center gap-1 p-8 text-center">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
									<Icon name="search" className="h-5 w-5 text-text-sub-600" />
								</div>
								<h3 className="font-semibold text-base text-text-strong-950">
									Select a delivery to inspect
								</h3>
								<p className="mx-auto max-w-sm text-balance font-medium text-[12px] text-text-sub-600">
									Click any row on the left to view its request details, status,
									and response body.
								</p>
								<div className="mt-4 flex items-center gap-1.5 text-text-soft-400 text-xs">
									<Icon name="arrow-left" className="h-3.5 w-3.5" />
									<span className="font-medium">
										Pick a delivery entry to get started
									</span>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Mobile Drawer (Only shown on small viewports) */}
			<Drawer.Root
				open={isMobile && !!selectedDeliveryId}
				onOpenChange={(open) => !open && setSelectedDeliveryId(null)}
			>
				<Drawer.Content className="w-[600px] max-w-[90vw]">
					{selectedDelivery ? (
						<DeliveryDetail
							delivery={selectedDelivery}
							onRetry={handleRetryDelivery}
							showCloseButton={true}
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
