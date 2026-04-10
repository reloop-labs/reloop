"use client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Table from "@reloop/ui/table";
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

			<div className="overflow-hidden rounded-xl border border-stroke-soft-200">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head className="font-medium text-[10px] uppercase tracking-wider">
								Time
							</Table.Head>
							<Table.Head className="font-medium text-[10px] uppercase tracking-wider">
								Status
							</Table.Head>
							<Table.Head className="font-medium text-[10px] uppercase tracking-wider">
								Event
							</Table.Head>
							<Table.Head className="font-medium text-[10px] uppercase tracking-wider">
								Delivery ID
							</Table.Head>
							<Table.Head className="font-medium text-[10px] uppercase tracking-wider">
								Duration
							</Table.Head>
							<Table.Head className="font-medium text-[10px] uppercase tracking-wider">
								Code
							</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body className="divide-y divide-stroke-soft-200">
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<Table.Row key={i}>
									<Table.Cell colSpan={6} className="p-4">
										<Skeleton className="h-6 w-full rounded" />
									</Table.Cell>
								</Table.Row>
							))
						) : filteredDeliveries.length === 0 ? (
							<Table.Row>
								<Table.Cell
									colSpan={6}
									className="h-32 text-center text-text-sub-600"
								>
									No deliveries found
								</Table.Cell>
							</Table.Row>
						) : (
							filteredDeliveries.map((delivery) => {
								const duration = delivery.completedAt
									? dayjs(delivery.completedAt).diff(
											dayjs(delivery.createdAt),
											"ms",
										)
									: null;

								return (
									<Table.Row
										key={delivery.id}
										className="cursor-pointer transition-colors hover:bg-bg-weak-50"
										onClick={() => setSelectedDeliveryId(delivery.id)}
									>
										<Table.Cell className="font-medium font-mono text-[13px] text-text-strong-950">
											{dayjs(delivery.createdAt).format("HH:mm:ss")}
										</Table.Cell>
										<Table.Cell>
											<span
												className={cn(
													"inline-flex rounded-full px-2 py-0.5 font-medium text-xs capitalize",
													getStatusColorClass(delivery.status),
												)}
											>
												{delivery.status}
											</span>
										</Table.Cell>
										<Table.Cell className="font-medium font-mono text-[13px] text-text-strong-950">
											{delivery.eventType}
										</Table.Cell>
										<Table.Cell className="font-mono text-text-sub-600 text-xs">
											{delivery.id.replace("dlv_", "").substring(0, 8)}
										</Table.Cell>
										<Table.Cell className="font-medium text-[13px] text-text-sub-600">
											{duration ? `${duration.toLocaleString()}ms` : "---"}
										</Table.Cell>
										<Table.Cell
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
										</Table.Cell>
									</Table.Row>
								);
							})
						)}
					</Table.Body>
				</Table.Root>

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
								<span className="truncate whitespace-nowrap font-medium">
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
