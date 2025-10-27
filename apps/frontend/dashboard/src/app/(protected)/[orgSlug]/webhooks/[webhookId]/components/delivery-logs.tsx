"use client";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

dayjs.extend(relativeTime);

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
	const [currentPage, setCurrentPage] = useState(1);
	const [dateRange, setDateRange] = useState("7d");

	const { data, error, isLoading } = useSWR<DeliveryListResponse>(
		`/api/webhook/deliveries/list?webhookId=${webhookId}&page=${currentPage}&limit=20&status=${statusFilter === "all" ? "" : statusFilter}`,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		},
	);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "success":
				return "bg-green-100 text-green-800 border-green-200";
			case "failed":
				return "bg-red-100 text-red-800 border-red-200";
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "retrying":
				return "bg-blue-100 text-blue-800 border-blue-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
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

	const totalPages = data ? Math.ceil(data.total / 20) : 0;

	return (
		<div className="space-y-6">
			<div className="mb-4 flex items-center gap-4">
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
						className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="1d">Last 24 hours</option>
						<option value="7d">Last 7 days</option>
						<option value="30d">Last 30 days</option>
						<option value="90d">Last 90 days</option>
					</select>
				</div>
			</div>

			<div className="rounded-lg border border-gray-200 bg-white">
				{isLoading ? (
					<div className="p-6">
						<div className="space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="h-16 animate-pulse rounded bg-gray-100"
								/>
							))}
						</div>
					</div>
				) : error ? (
					<div className="p-6 text-center">
						<Icon
							name="alert-circle"
							className="mx-auto mb-2 h-8 w-8 text-red-500"
						/>
						<p className="text-gray-500 text-sm">
							Failed to load delivery logs
						</p>
					</div>
				) : filteredDeliveries.length === 0 ? (
					<div className="p-6 text-center">
						<Icon
							name="activity"
							className="mx-auto mb-2 h-8 w-8 text-gray-400"
						/>
						<p className="text-gray-500 text-sm">No deliveries found</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredDeliveries.map((delivery) => (
							<div key={delivery.id} className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Badge.Root
											className={cn(
												"border font-medium text-xs",
												getStatusColor(delivery.status),
											)}
										>
											<Icon
												name={getStatusIcon(delivery.status)}
												className="mr-1 h-3 w-3"
											/>
											{delivery.status}
										</Badge.Root>
										<div>
											<h4 className="font-medium text-gray-900">
												{delivery.eventName}
											</h4>
											<p className="text-gray-500 text-sm">
												Attempt {delivery.attemptNumber} of{" "}
												{delivery.maxAttempts} •{" "}
												{dayjs(delivery.lastAttemptAt).fromNow()}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{delivery.responseStatus && (
											<span className="font-mono text-gray-500 text-sm">
												{delivery.responseStatus}
											</span>
										)}
										<Button.Root
											size="xsmall"
											variant="neutral"
											onClick={() =>
												setExpandedDelivery(
													expandedDelivery === delivery.id ? null : delivery.id,
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
									</div>
								</div>

								{expandedDelivery === delivery.id && (
									<div className="mt-4 space-y-4 border-t pt-4">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<h5 className="mb-2 font-medium text-gray-900 text-sm">
													Request
												</h5>
												<div className="space-y-2">
													<div>
														<span className="text-gray-500 text-xs">URL:</span>
														<p className="rounded bg-gray-100 p-2 font-mono text-xs">
															{delivery.requestUrl}
														</p>
													</div>
													{delivery.requestHeaders && (
														<div>
															<span className="text-gray-500 text-xs">
																Headers:
															</span>
															<pre className="overflow-x-auto rounded bg-gray-100 p-2 font-mono text-xs">
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
															<span className="text-gray-500 text-xs">
																Body:
															</span>
															<pre className="overflow-x-auto rounded bg-gray-100 p-2 font-mono text-xs">
																{JSON.stringify(delivery.requestBody, null, 2)}
															</pre>
														</div>
													)}
												</div>
											</div>
											<div>
												<h5 className="mb-2 font-medium text-gray-900 text-sm">
													Response
												</h5>
												<div className="space-y-2">
													{delivery.responseStatus && (
														<div>
															<span className="text-gray-500 text-xs">
																Status:
															</span>
															<p className="rounded bg-gray-100 p-2 font-mono text-xs">
																{delivery.responseStatus}
															</p>
														</div>
													)}
													{delivery.responseHeaders && (
														<div>
															<span className="text-gray-500 text-xs">
																Headers:
															</span>
															<pre className="overflow-x-auto rounded bg-gray-100 p-2 font-mono text-xs">
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
															<span className="text-gray-500 text-xs">
																Body:
															</span>
															<pre className="max-h-32 overflow-x-auto rounded bg-gray-100 p-2 font-mono text-xs">
																{delivery.responseBody}
															</pre>
														</div>
													)}
													{delivery.errorMessage && (
														<div>
															<span className="text-gray-500 text-xs">
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
								)}
							</div>
						))}
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="border-gray-200 border-t px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="text-gray-500 text-sm">
								Page {currentPage} of {totalPages}
							</div>
							<div className="flex items-center gap-2">
								<Button.Root
									size="small"
									variant="neutral"
									onClick={() =>
										setCurrentPage((prev) => Math.max(1, prev - 1))
									}
									disabled={currentPage === 1}
								>
									<Icon name="chevron-left" className="mr-1 h-4 w-4" />
									Previous
								</Button.Root>
								<Button.Root
									size="small"
									variant="neutral"
									onClick={() =>
										setCurrentPage((prev) => Math.min(totalPages, prev + 1))
									}
									disabled={currentPage === totalPages}
								>
									Next
									<Icon name="chevron-right" className="ml-1 h-4 w-4" />
								</Button.Root>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
