import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
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

const DeliveryDetail = ({
	delivery,
	onRetry,
	showCloseButton,
	onClose,
}: DeliveryDetailProps) => {
	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-stroke-soft-200 border-b p-6">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold text-lg text-text-strong-950">
							{delivery.eventType}
						</h3>
						<span
							className={cn(
								"inline-flex rounded-full px-2 py-0.5 font-medium text-xs capitalize",
								getStatusColorClass(delivery.status),
							)}
						>
							{delivery.status}
						</span>
					</div>
					<p className="text-sm text-text-sub-600">
						{dayjs(delivery.createdAt).format("MMMM D, YYYY [at] h:mm:ss A")}
					</p>
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

			<div className="flex-1 overflow-y-auto p-6">
				<div className="grid grid-cols-1 gap-8">
					<div className="grid grid-cols-2 gap-4 rounded-lg bg-bg-weak-25 p-4 md:grid-cols-4">
						<div>
							<p className="text-text-sub-600 text-xs uppercase tracking-wider">
								Delivery Status
							</p>
							<p className="mt-1 font-medium text-sm capitalize">
								{delivery.status}
							</p>
						</div>
						<div>
							<p className="text-text-sub-600 text-xs uppercase tracking-wider">
								Attempt
							</p>
							<p className="mt-1 font-medium text-sm">
								{delivery.attemptNumber} of {delivery.maxAttempts}
							</p>
						</div>
						<div>
							<p className="text-text-sub-600 text-xs uppercase tracking-wider">
								Event ID
							</p>
							<p className="mt-1 truncate font-mono text-xs">
								{delivery.webhookEventId || "N/A"}
							</p>
						</div>
						<div>
							<p className="text-text-sub-600 text-xs uppercase tracking-wider">
								API Version
							</p>
							<p className="mt-1 font-medium text-sm">2026-04-03</p>
						</div>
					</div>

					<section className="space-y-3">
						<h4 className="font-semibold text-text-strong-950 text-xs uppercase tracking-wider">
							Response
						</h4>
						<div className="overflow-hidden rounded-xl border border-stroke-soft-200">
							<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-25 px-4 py-3">
								<span className="font-medium text-sm">
									HTTP status code {delivery.responseStatus}
								</span>
							</div>
							<div className="overflow-hidden bg-white p-4">
								{delivery.responseBody ? (
									<pre className="max-h-[300px] overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-[13px] text-white leading-relaxed">
										{delivery.responseBody.startsWith("{")
											? JSON.stringify(
													JSON.parse(delivery.responseBody),
													null,
													2,
												)
											: delivery.responseBody}
									</pre>
								) : (
									<div className="py-8 text-center text-sm text-text-sub-600 italic">
										No response body provided
									</div>
								)}
							</div>
						</div>
					</section>

					<section className="space-y-3">
						<h4 className="font-semibold text-text-strong-950 text-xs uppercase tracking-wider">
							Request
						</h4>
						<div className="overflow-hidden rounded-xl border border-stroke-soft-200">
							<div className="border-stroke-soft-200 border-b bg-bg-weak-25 px-4 py-3">
								<p className="mb-1 font-medium text-text-sub-600 text-xs">
									URL
								</p>
								<code className="break-all font-medium text-sm">
									{delivery.requestUrl}
								</code>
							</div>
							<div className="space-y-4 bg-white p-4">
								{delivery.requestHeaders && (
									<div>
										<p className="mb-2 font-medium text-text-sub-600 text-xs">
											Headers
										</p>
										<pre className="overflow-x-auto rounded-lg bg-bg-weak-50 p-3 font-mono text-text-sub-600 text-xs">
											{JSON.stringify(delivery.requestHeaders, null, 2)}
										</pre>
									</div>
								)}
								{delivery.requestBody && (
									<div>
										<p className="mb-2 font-medium text-text-sub-600 text-xs">
											Body
										</p>
										<pre className="overflow-x-auto rounded-lg bg-bg-weak-50 p-3 font-mono text-text-sub-600 text-xs">
											{JSON.stringify(delivery.requestBody, null, 2)}
										</pre>
									</div>
								)}
							</div>
						</div>
					</section>
				</div>
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
					<div className="-mt-2.5 overflow-hidden divide-y divide-stroke-soft-100 rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
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
					<div className="min-h-[500px] flex-1 rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
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
