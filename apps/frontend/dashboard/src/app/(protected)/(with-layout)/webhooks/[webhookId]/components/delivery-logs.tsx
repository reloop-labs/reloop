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
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

dayjs.extend(relativeTime);

const GRID = "grid-cols-[100px_100px_1fr_120px_100px_80px]";

const DeliverySkeleton = () => (
	<div className={cn("grid w-full items-center gap-4 px-4 py-3", GRID)}>
		<Skeleton className="h-4 w-16" />
		<Skeleton className="h-5 w-16 rounded-[4px]" />
		<Skeleton className="h-4 w-full" />
		<Skeleton className="h-4 w-16" />
		<Skeleton className="h-4 w-12" />
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

	const selectedDelivery =
		filteredDeliveries.find((d) => d.id === selectedDeliveryId) ||
		filteredDeliveries[0];

	const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	return (
		<div className="flex flex-col space-y-6">
			{/* Filters */}
			<div className="flex items-center justify-between gap-4">
				<div className="max-w-sm flex-1">
					<Input.Root size="small">
						<Input.Wrapper className="border-0 bg-transparent px-0 shadow-none focus-within:ring-0">
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

			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
				<div
					className={cn(
						"grid items-center gap-4 border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600 dark:border-stroke-soft-100/50",
						GRID,
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
					<div className="flex items-center gap-2 whitespace-nowrap text-xs">
						<Icon name="hash" className="h-3.5 w-3.5" />
						<span className="font-medium">Delivery ID</span>
					</div>
					<div className="flex items-center gap-2 text-xs">
						<Icon name="clock" className="h-3.5 w-3.5" />
						<span className="font-medium">Duration</span>
					</div>
					<div className="flex items-center gap-2 text-xs">
						<Icon name="code" className="h-3.5 w-3.5" />
						<span className="font-medium">Code</span>
					</div>
				</div>
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{isLoading ? (
						Array.from({ length: 5 }).map((_, i) => (
							<DeliverySkeleton key={i} />
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
									onClick={() => setSelectedDeliveryId(delivery.id)}
									className={cn(
										"group/row grid w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition-colors",
										GRID,
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
									<div className="truncate font-mono text-text-sub-600 text-xs">
										{delivery.id.replace("dlv_", "").substring(0, 8)}
									</div>
									<div className="font-medium text-[13px] text-text-sub-600">
										{duration ? `${duration.toLocaleString()}ms` : "---"}
									</div>
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
				</div>
				{/* Pagination footer */}
				{data && data.total > 0 && (
					<div className="flex items-center justify-between border-stroke-soft-100 border-t bg-bg-white-0 px-4 py-3 text-paragraph-sm text-text-sub-600 dark:border-stroke-soft-100/50">
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

			<Drawer.Root
				open={!!selectedDeliveryId}
				onOpenChange={(open) => !open && setSelectedDeliveryId(null)}
			>
				<Drawer.Content className="w-[600px] max-w-[90vw]">
					{selectedDelivery ? (
						<div className="flex h-full flex-col">
							<div className="flex items-center justify-between border-stroke-soft-200 border-b p-6">
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-2">
										<h3 className="font-semibold text-lg text-text-strong-950">
											{selectedDelivery.eventType}
										</h3>
										<span
											className={cn(
												"inline-flex rounded-full px-2 py-0.5 font-medium text-xs capitalize",
												getStatusColorClass(selectedDelivery.status),
											)}
										>
											{selectedDelivery.status}
										</span>
									</div>
									<p className="text-sm text-text-sub-600">
										{dayjs(selectedDelivery.createdAt).format(
											"MMMM D, YYYY [at] h:mm:ss A",
										)}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Button.Root
										size="small"
										variant="neutral"
										mode="stroke"
										onClick={() => handleRetryDelivery(selectedDelivery.id)}
									>
										<Icon name="refresh-cw" className="mr-2 h-4 w-4" />
										Resend
									</Button.Root>
									<Drawer.Close asChild>
										<Button.Root
											size="small"
											variant="neutral"
											mode="stroke"
											className="px-2"
										>
											<Icon name="cross" className="h-4 w-4" />
										</Button.Root>
									</Drawer.Close>
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
												{selectedDelivery.status}
											</p>
										</div>
										<div>
											<p className="text-text-sub-600 text-xs uppercase tracking-wider">
												Attempt
											</p>
											<p className="mt-1 font-medium text-sm">
												{selectedDelivery.attemptNumber} of{" "}
												{selectedDelivery.maxAttempts}
											</p>
										</div>
										<div>
											<p className="text-text-sub-600 text-xs uppercase tracking-wider">
												Event ID
											</p>
											<p className="mt-1 truncate font-mono text-xs">
												{selectedDelivery.webhookEventId || "N/A"}
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
													HTTP status code {selectedDelivery.responseStatus}
												</span>
											</div>
											<div className="overflow-hidden bg-white p-4">
												{selectedDelivery.responseBody ? (
													<pre className="max-h-[300px] overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-[13px] text-white leading-relaxed">
														{selectedDelivery.responseBody.startsWith("{")
															? JSON.stringify(
																	JSON.parse(selectedDelivery.responseBody),
																	null,
																	2,
																)
															: selectedDelivery.responseBody}
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
													{selectedDelivery.requestUrl}
												</code>
											</div>
											<div className="space-y-4 bg-white p-4">
												{selectedDelivery.requestHeaders && (
													<div>
														<p className="mb-2 font-medium text-text-sub-600 text-xs">
															Headers
														</p>
														<pre className="overflow-x-auto rounded-lg bg-bg-weak-50 p-3 font-mono text-text-sub-600 text-xs">
															{JSON.stringify(
																selectedDelivery.requestHeaders,
																null,
																2,
															)}
														</pre>
													</div>
												)}
												{selectedDelivery.requestBody && (
													<div>
														<p className="mb-2 font-medium text-text-sub-600 text-xs">
															Body
														</p>
														<pre className="overflow-x-auto rounded-lg bg-bg-weak-50 p-3 font-mono text-text-sub-600 text-xs">
															{JSON.stringify(
																selectedDelivery.requestBody,
																null,
																2,
															)}
														</pre>
													</div>
												)}
											</div>
										</div>
									</section>
								</div>
							</div>
						</div>
					) : (
						<div />
					)}
				</Drawer.Content>
			</Drawer.Root>
		</div>
	);
};
