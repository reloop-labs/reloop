"use client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

dayjs.extend(relativeTime);

const getStatusColorClass = (status: string) => {
	switch (status) {
		case "success":
			return "text-green-600 bg-green-50 border-green-200";
		case "failed":
			return "text-red-600 bg-red-50 border-red-200";
		case "pending":
			return "text-yellow-600 bg-yellow-50 border-yellow-200";
		case "retrying":
			return "text-blue-600 bg-blue-50 border-blue-200";
		default:
			return "text-gray-600 bg-gray-50 border-gray-200";
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
	const [dateRange, setDateRange] = useState("7d");

	const { data, error, isLoading } = useSWR<DeliveryListResponse>(
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

	return (
		<div className="flex flex-col space-y-6">
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

			<div className="grid h-[700px] grid-cols-1 overflow-hidden rounded-xl border border-stroke-soft-200 shadow-regular-md md:grid-cols-[400px_1fr]">
				{/* Left Pane: List */}
				<div className="flex flex-col border-stroke-soft-200 border-r bg-bg-weak-25">
					<div className="flex-1 overflow-y-auto">
						{isLoading ? (
							<div className="space-y-2 p-4">
								{Array.from({ length: 8 }).map((_, i) => (
									<Skeleton key={i} className="h-16 w-full rounded-lg" />
								))}
							</div>
						) : error ? (
							<div className="flex flex-col items-center justify-center p-12 text-center">
								<Icon
									name="info-outline"
									className="mb-2 h-8 w-8 text-red-500"
								/>
								<p className="text-sm text-text-sub-600">
									Failed to load delivery logs
								</p>
							</div>
						) : filteredDeliveries.length === 0 ? (
							<div className="flex flex-col items-center justify-center p-12 text-center">
								<Icon
									name="activity"
									className="mb-2 h-8 w-8 text-text-sub-400"
								/>
								<p className="text-sm text-text-sub-600">No deliveries found</p>
							</div>
						) : (
							<div className="divide-y divide-stroke-soft-200">
								{filteredDeliveries.map((delivery) => (
									<button
										key={delivery.id}
										type="button"
										onClick={() => setSelectedDeliveryId(delivery.id)}
										className={cn(
											"flex w-full flex-col gap-1 p-4 text-left transition-colors hover:bg-bg-weak-50",
											(selectedDeliveryId === delivery.id ||
												(!selectedDeliveryId &&
													selectedDelivery?.id === delivery.id)) &&
												"bg-white shadow-inner sm:border-brand-base-600 sm:border-l-2",
										)}
									>
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-2">
												{delivery.responseStatus && (
													<span className="font-mono text-text-sub-600 text-xs">
														{delivery.responseStatus}
													</span>
												)}
												<div
													className={cn(
														"h-1.5 w-1.5 rounded-full",
														delivery.status === "success"
															? "bg-green-500"
															: delivery.status === "failed"
																? "bg-red-500"
																: "bg-yellow-500",
													)}
												/>
												<span className="truncate font-medium text-text-strong-950 text-xs">
													{delivery.eventType}
												</span>
											</div>
											<span className="shrink-0 text-text-sub-600 text-xs">
												{dayjs(delivery.createdAt).format("h:mm:ss A")}
											</span>
										</div>
										<div className="flex items-center justify-between gap-2">
											<span className="truncate text-text-sub-600 text-xs">
												{delivery.requestUrl}
											</span>
										</div>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Pagination footer */}
					{data && data.total > 0 && (
						<div className="border-stroke-soft-200 border-t bg-white p-4">
							<div className="flex items-center justify-between gap-4 text-text-sub-600 text-xs">
								<div className="flex items-center gap-1.5">
									<Button.Root
										size="xxsmall"
										variant="neutral"
										mode="stroke"
										onClick={() =>
											setCurrentPage((prev) => Math.max(1, prev - 1))
										}
										disabled={currentPage === 1}
									>
										<Icon name="chevron-left" className="h-3 w-3" />
									</Button.Root>
									<span className="whitespace-nowrap">
										{currentPage} / {totalPages}
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
										<Icon name="chevron-right" className="h-3 w-3" />
									</Button.Root>
								</div>
								<Select.Root
									value={String(pageSize)}
									onValueChange={(value) => {
										setPageSize(Number(value));
										setCurrentPage(1);
									}}
									size="xsmall"
								>
									<Select.Trigger className="h-7 w-14 text-[10px]">
										<Select.Value />
									</Select.Trigger>
									<Select.Content className="min-w-16">
										{["10", "20", "50"].map((v) => (
											<Select.Item key={v} value={v} className="text-xs">
												{v}
											</Select.Item>
										))}
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					)}
				</div>

				{/* Right Pane: Details */}
				<div className="flex flex-col overflow-hidden bg-white">
					{selectedDelivery ? (
						<div className="flex h-full flex-col">
							{/* Header */}
							<div className="flex items-center justify-between border-stroke-soft-200 border-b p-6">
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-2">
										<h3 className="font-semibold text-lg text-text-strong-950">
											{selectedDelivery.eventType}
										</h3>
										<div
											className={cn(
												"rounded-full border px-2 py-0.5 font-medium text-xs capitalize",
												getStatusColorClass(selectedDelivery.status),
											)}
										>
											{selectedDelivery.status}
										</div>
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
								</div>
							</div>

							{/* Content */}
							<div className="flex-1 overflow-y-auto p-6">
								<div className="grid grid-cols-1 gap-8">
									{/* Info Section */}
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

									{/* Response Section */}
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

									{/* Request Section */}
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
						<div className="flex h-full flex-col items-center justify-center p-12 text-center text-text-sub-600">
							<Icon
								name="activity"
								className="mb-4 h-12 w-12 text-bg-weak-100"
							/>
							<p>Select a delivery attempt to view its details</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
