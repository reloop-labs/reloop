"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

dayjs.extend(relativeTime);

// Animation utility function similar to audience table
const getAnimationProps = (index: number, delay = 0) => ({
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: {
		duration: 0.3,
		delay: delay + index * 0.05,
		ease: [0.4, 0, 0.2, 1] as const,
	},
});

interface DeliveryLogsProps {
	webhookId: string;
}

interface Delivery {
	id: string;
	eventId: string;
	eventName: string;
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
	lastAttemptAt: string;
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

export const DeliveryLogs = ({ webhookId }: DeliveryLogsProps) => {
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize, setPageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [dateRange, setDateRange] = useState("7d");

	const { data, error, isLoading } = useSWR<DeliveryListResponse>(
		`/api/webhook/deliveries/list?webhookId=${webhookId}&page=${currentPage}&limit=${pageSize}&status=${statusFilter === "all" ? "" : statusFilter}`,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		},
	);

	const getStatusColorClass = (status: string) => {
		switch (status) {
			case "success":
				return "bg-green-50 text-green-700 border-green-200";
			case "failed":
				return "bg-red-50 text-red-700 border-red-200";
			case "pending":
				return "bg-yellow-50 text-yellow-700 border-yellow-200";
			case "retrying":
				return "bg-blue-50 text-blue-700 border-blue-200";
			default:
				return "bg-gray-50 text-gray-700 border-gray-200";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "success":
				return "check-circle";
			case "failed":
				return "x-circle";
			case "pending":
				return "clock";
			case "retrying":
				return "refresh-cw";
			default:
				return "circle";
		}
	};

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
			await mutate(`/api/webhook/deliveries/list?webhookId=${webhookId}`);
		} catch {
			toast.error("Failed to retry delivery");
		}
	};

	const filteredDeliveries =
		data?.deliveries?.filter((delivery) => {
			const matchesSearch =
				searchQuery === "" ||
				delivery.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				delivery.requestUrl.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesSearch;
		}) || [];

	const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
	const startIndex = data && data.total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
	const endIndex = data ? Math.min(currentPage * pageSize, data.total) : 0;

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Icon
								as={() => <Icon name="search" className="h-4 w-4" />}
							/>
							<Input.Input
								type="text"
								placeholder="Search deliveries..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="w-40">
					<Select.Root
						size="small"
						value={statusFilter}
						onValueChange={setStatusFilter}
					>
						<Select.Trigger>
							<Select.Value placeholder="All statuses" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="all">All statuses</Select.Item>
							<Select.Item value="success">Success</Select.Item>
							<Select.Item value="failed">Failed</Select.Item>
							<Select.Item value="pending">Pending</Select.Item>
							<Select.Item value="retrying">Retrying</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div className="w-32">
					<select
						value={dateRange}
						onChange={(e) => setDateRange(e.target.value)}
						className="w-full rounded-md border border-stroke-soft-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="1d">Last 24 hours</option>
						<option value="7d">Last 7 days</option>
						<option value="30d">Last 30 days</option>
						<option value="90d">Last 90 days</option>
					</select>
				</div>
			</div>

			{/* Table */}
			<AnimatePresence mode="wait">
				<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
					<div className="grid grid-cols-[1fr_minmax(120px,auto)_minmax(100px,auto)_minmax(80px,auto)_minmax(40px,auto)]">
						{/* Header */}
						<div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
							<div className="py-2.5">Event</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="py-2.5">Status</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="py-2.5">Attempt</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="py-2.5">Time</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="py-2.5" />
						</div>

						{/* Content */}
						{isLoading ? (
							// Skeleton loading state
							Array.from({ length: 5 }).map((_, index) => (
								<div key={`skeleton-${index}`} className="group/row contents">
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="my-1 pl-5">
											<Skeleton className="h-4 w-32" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="flex items-center gap-2">
											<Skeleton className="h-2 w-2 rounded-full" />
											<Skeleton className="h-4 w-16" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-20" />
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-16" />
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-4" />
									</div>
								</div>
							))
						) : error ? (
							<div className="col-span-5 p-6 text-center">
								<Icon
									name="info-outline"
									className="mx-auto mb-2 h-8 w-8 text-red-500"
								/>
								<p className="text-sm text-text-sub-600">
									Failed to load delivery logs
								</p>
							</div>
						) : filteredDeliveries.length === 0 ? (
							<div className="col-span-5 p-6 text-center">
								<Icon
									name="activity"
									className="mx-auto mb-2 h-8 w-8 text-text-sub-400"
								/>
								<p className="text-sm text-text-sub-600">No deliveries found</p>
							</div>
						) : (
							filteredDeliveries.map((delivery, index) => (
								<div key={`delivery-${index}`} className="group/row contents">
									{/* Event Name */}
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 0)}
											className="flex items-center gap-2 pl-5"
										>
											<Icon
												name="webhook"
												className="h-4 w-4 text-text-sub-600"
											/>
											<div className="flex flex-col">
												<span className="font-medium text-label-sm text-text-strong-950">
													{delivery.eventName}
												</span>
												<span className="text-label-xs text-text-sub-600">
													{delivery.requestUrl}
												</span>
											</div>
										</motion.div>
									</div>

									{/* Status */}
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 1)}
											className="flex items-center gap-2"
										>
											<div
												className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 font-medium text-label-xs capitalize ${getStatusColorClass(delivery.status)}`}
											>
												<Icon
													name={getStatusIcon(delivery.status)}
													className="h-3.5 w-3.5"
												/>
												{delivery.status}
											</div>
										</motion.div>
									</div>

									{/* Attempt */}
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 2)}
											className="flex items-center gap-2"
										>
											<span className="text-label-sm text-text-strong-950">
												{delivery.attemptNumber}/{delivery.maxAttempts}
											</span>
											{delivery.responseStatus && (
												<span className="font-mono text-text-sub-600 text-xs">
													{delivery.responseStatus}
												</span>
											)}
										</motion.div>
									</div>

									{/* Time */}
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.span
											{...getAnimationProps(index + 1, 3)}
											className="text-label-sm text-text-strong-950"
										>
											{dayjs(delivery.lastAttemptAt).fromNow()}
										</motion.span>
									</div>

									{/* Actions */}
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 4)}
											className="flex items-center justify-center gap-2"
										>
											<Button.Root
												size="xsmall"
												variant="neutral"
												onClick={() =>
													setExpandedDelivery(
														expandedDelivery === delivery.id
															? null
															: delivery.id,
													)
												}
											>
												<Icon
													name={
														expandedDelivery === delivery.id
															? "chevron-up"
															: "chevron-down"
													}
													className="mr-1 h-3 w-3"
												/>
												{expandedDelivery === delivery.id ? "Hide" : "Details"}
											</Button.Root>
											{delivery.status === "failed" && (
												<Button.Root
													size="xsmall"
													variant="primary"
													onClick={() => handleRetryDelivery(delivery.id)}
												>
													<Icon name="refresh-cw" className="mr-1 h-3 w-3" />
													Retry
												</Button.Root>
											)}
										</motion.div>
									</div>
								</div>
							))
						)}
					</div>

					{/* Expanded Details */}
					{expandedDelivery && (
						<div className="border-stroke-soft-200 border-t bg-bg-weak-25 p-6">
							{filteredDeliveries
								.filter((delivery) => delivery.id === expandedDelivery)
								.map((delivery) => (
									<div key={delivery.id} className="space-y-4">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<h5 className="mb-2 font-medium text-sm text-text-strong-950">
													Request
												</h5>
												<div className="space-y-2">
													<div>
														<span className="text-text-sub-600 text-xs">
															URL:
														</span>
														<p className="rounded bg-bg-weak-100 p-2 font-mono text-xs">
															{delivery.requestUrl}
														</p>
													</div>
													{delivery.requestHeaders && (
														<div>
															<span className="text-text-sub-600 text-xs">
																Headers:
															</span>
															<pre className="overflow-x-auto rounded bg-bg-weak-100 p-2 font-mono text-xs">
																{JSON.stringify(
																	delivery.requestHeaders,
																	null,
																	2,
																)}
															</pre>
														</div>
													)}
													{delivery.requestBody && (
														<div>
															<span className="text-text-sub-600 text-xs">
																Body:
															</span>
															<pre className="overflow-x-auto rounded bg-bg-weak-100 p-2 font-mono text-xs">
																{JSON.stringify(delivery.requestBody, null, 2)}
															</pre>
														</div>
													)}
												</div>
											</div>
											<div>
												<h5 className="mb-2 font-medium text-sm text-text-strong-950">
													Response
												</h5>
												<div className="space-y-2">
													{delivery.responseStatus && (
														<div>
															<span className="text-text-sub-600 text-xs">
																Status:
															</span>
															<p className="rounded bg-bg-weak-100 p-2 font-mono text-xs">
																{delivery.responseStatus}
															</p>
														</div>
													)}
													{delivery.responseHeaders && (
														<div>
															<span className="text-text-sub-600 text-xs">
																Headers:
															</span>
															<pre className="overflow-x-auto rounded bg-bg-weak-100 p-2 font-mono text-xs">
																{JSON.stringify(
																	delivery.responseHeaders,
																	null,
																	2,
																)}
															</pre>
														</div>
													)}
													{delivery.responseBody && (
														<div>
															<span className="text-text-sub-600 text-xs">
																Body:
															</span>
															<pre className="max-h-32 overflow-x-auto rounded bg-bg-weak-100 p-2 font-mono text-xs">
																{delivery.responseBody}
															</pre>
														</div>
													)}
													{delivery.errorMessage && (
														<div>
															<span className="text-text-sub-600 text-xs">
																Error:
															</span>
															<p className="rounded bg-red-50 p-2 text-red-600 text-xs">
																{delivery.errorMessage}
															</p>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
						</div>
					)}

					{/* Pagination */}
					{data && data.total > 0 && (
						<div className="border-stroke-soft-200 border-t px-6 py-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3 text-sm text-text-sub-600">
									<span>Showing {startIndex}–{endIndex} of {data.total}</span>
									<Select.Root
										value={String(pageSize)}
										onValueChange={(value) => {
											setPageSize(Number(value));
											setCurrentPage(1);
										}}
										size="xsmall"
									>
										<Select.Trigger className="w-16 text-xs">
											<Select.Value />
										</Select.Trigger>
										<Select.Content className="text-xs min-w-16">
											<Select.Item value="10" className="text-xs">10</Select.Item>
											<Select.Item value="20" className="text-xs">20</Select.Item>
											<Select.Item value="50" className="text-xs">50</Select.Item>
											<Select.Item value="100" className="text-xs">100</Select.Item>
										</Select.Content>
									</Select.Root>
								</div>
								<div className="flex items-center gap-2">
									<Button.Root
										size="xxsmall"
										variant="neutral"
										mode="stroke"
										onClick={() =>
											setCurrentPage((prev) => Math.max(1, prev - 1))
										}
										disabled={currentPage === 1}
									>
										<Icon name="chevron-left" className="h-4 w-4" />
									</Button.Root>
									<span className="px-2 text-sm text-text-sub-600">
										Page {currentPage} of {totalPages}
									</span>
									<Button.Root
										size="xxsmall"
										variant="neutral"
										mode="stroke"
										onClick={() =>
											setCurrentPage((prev) => Math.min(totalPages, prev + 1))
										}
										disabled={currentPage === totalPages}
									>
										<Icon name="chevron-right" className="h-4 w-4" />
									</Button.Root>
								</div>
							</div>
						</div>
					)}
				</div>
			</AnimatePresence>
		</div>
	);
};
