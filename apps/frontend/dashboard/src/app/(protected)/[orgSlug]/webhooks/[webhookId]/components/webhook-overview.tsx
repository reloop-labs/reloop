"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface WebhookOverviewProps {
	webhook: {
		id: string;
		name: string;
		url: string;
		secret: string | null;
		status: "active" | "paused" | "disabled" | "failed";
		successCount: number;
		failureCount: number;
		lastTriggeredAt: string | null;
		createdAt: string;
	};
}

interface DeliveryData {
	id: string;
	eventId: string;
	eventName: string;
	status: "pending" | "success" | "failed" | "retrying";
	responseStatus: number | null;
	attemptNumber: number;
	lastAttemptAt: string;
	errorMessage: string | null;
}

interface DeliveryListResponse {
	deliveries: DeliveryData[];
	total: number;
	page: number;
	limit: number;
}

export const WebhookOverview = ({ webhook }: WebhookOverviewProps) => {
	const [secretVisible, setSecretVisible] = useState(false);
	const [copied, setCopied] = useState(false);

	const { data: recentDeliveries, isLoading } = useSWR<DeliveryListResponse>(
		`/api/webhook/deliveries?webhookId=${webhook.id}&limit=10`,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		},
	);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			toast.error("Failed to copy to clipboard");
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "success":
				return "text-green-600 bg-green-50";
			case "failed":
				return "text-red-600 bg-red-50";
			case "pending":
				return "text-yellow-600 bg-yellow-50";
			case "retrying":
				return "text-blue-600 bg-blue-50";
			default:
				return "text-gray-600 bg-gray-50";
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

	return (
		<div className="space-y-6">
			{/* Webhook Details */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="rounded-lg border border-gray-200 bg-white p-6">
					<h3 className="mb-4 font-medium text-gray-900 text-lg">
						Webhook Details
					</h3>
					<div className="space-y-4">
						<div>
							<label className="font-medium text-gray-500 text-sm">
								Endpoint URL
							</label>
							<div className="mt-1 flex items-center gap-2">
								<span className="flex-1 truncate rounded bg-gray-100 px-2 py-1 font-mono text-sm">
									{webhook.url}
								</span>
								<button
									onClick={() => copyToClipboard(webhook.url)}
									className="rounded p-1 transition-colors hover:bg-gray-100"
									title="Copy URL"
								>
									<Icon
										name={copied ? "check" : "copy"}
										className="h-4 w-4 text-gray-400 hover:text-gray-600"
									/>
								</button>
							</div>
						</div>

						<div>
							<label className="font-medium text-gray-500 text-sm">
								Signing Secret
							</label>
							<div className="mt-1 flex items-center gap-2">
								<span className="flex-1 rounded bg-gray-100 px-2 py-1 font-mono text-sm">
									{secretVisible
										? webhook.secret || "No secret"
										: "••••••••••••••••"}
								</span>
								<button
									onClick={() => setSecretVisible(!secretVisible)}
									className="rounded p-1 transition-colors hover:bg-gray-100"
									title={secretVisible ? "Hide secret" : "Show secret"}
								>
									<Icon
										name={secretVisible ? "eye-off" : "eye"}
										className="h-4 w-4 text-gray-400 hover:text-gray-600"
									/>
								</button>
								{webhook.secret && (
									<button
										onClick={() => copyToClipboard(webhook.secret!)}
										className="rounded p-1 transition-colors hover:bg-gray-100"
										title="Copy secret"
									>
										<Icon
											name="copy"
											className="h-4 w-4 text-gray-400 hover:text-gray-600"
										/>
									</button>
								)}
							</div>
						</div>

						<div>
							<label className="font-medium text-gray-500 text-sm">
								Created
							</label>
							<p className="mt-1 text-gray-900 text-sm">
								{new Date(webhook.createdAt).toLocaleDateString()} at{" "}
								{new Date(webhook.createdAt).toLocaleTimeString()}
							</p>
						</div>

						{webhook.lastTriggeredAt && (
							<div>
								<label className="font-medium text-gray-500 text-sm">
									Last Triggered
								</label>
								<p className="mt-1 text-gray-900 text-sm">
									{new Date(webhook.lastTriggeredAt).toLocaleDateString()} at{" "}
									{new Date(webhook.lastTriggeredAt).toLocaleTimeString()}
								</p>
							</div>
						)}
					</div>
				</div>

				<div className="rounded-lg border border-gray-200 bg-white p-6">
					<h3 className="mb-4 font-medium text-gray-900 text-lg">Statistics</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-sm">Total Deliveries</span>
							<span className="font-semibold text-gray-900 text-lg">
								{webhook.successCount + webhook.failureCount}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-sm">Success Rate</span>
							<span className="font-semibold text-green-600 text-lg">
								{webhook.successCount + webhook.failureCount > 0
									? Math.round(
											(webhook.successCount /
												(webhook.successCount + webhook.failureCount)) *
												100,
										)
									: 0}
								%
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-sm">
								Average Response Time
							</span>
							<span className="font-semibold text-gray-900 text-lg">--</span>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Deliveries */}
			<div className="rounded-lg border border-gray-200 bg-white">
				<div className="border-gray-200 border-b px-6 py-4">
					<h3 className="font-medium text-gray-900 text-lg">
						Recent Deliveries
					</h3>
					<p className="mt-1 text-gray-500 text-sm">
						Latest delivery attempts for this webhook
					</p>
				</div>

				<div className="p-6">
					{isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="h-12 animate-pulse rounded bg-gray-100"
								/>
							))}
						</div>
					) : recentDeliveries?.deliveries &&
						recentDeliveries.deliveries.length > 0 ? (
						<div className="space-y-3">
							{recentDeliveries.deliveries.map((delivery) => (
								<div
									key={delivery.id}
									className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
								>
									<div className="flex items-center gap-3">
										<div
											className={`rounded-full px-2 py-1 font-medium text-xs ${getStatusColor(delivery.status)}`}
										>
											<Icon
												name={getStatusIcon(delivery.status)}
												className="mr-1 inline h-3 w-3"
											/>
											{delivery.status}
										</div>
										<div>
											<p className="font-medium text-gray-900 text-sm">
												{delivery.eventName}
											</p>
											<p className="text-gray-500 text-xs">
												Attempt {delivery.attemptNumber} •{" "}
												{new Date(delivery.lastAttemptAt).toLocaleString()}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{delivery.responseStatus && (
											<span className="font-mono text-gray-500 text-xs">
												{delivery.responseStatus}
											</span>
										)}
										{delivery.status === "failed" && (
											<Button.Root
												size="xsmall"
												variant="neutral"
												onClick={() => {
													// TODO: Implement retry functionality
													toast.info("Retry functionality coming soon");
												}}
											>
												<Icon name="refresh-cw" className="mr-1 h-3 w-3" />
												Retry
											</Button.Root>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="py-8 text-center">
							<Icon
								name="activity"
								className="mx-auto mb-2 h-8 w-8 text-gray-400"
							/>
							<p className="text-gray-500 text-sm">No deliveries yet</p>
							<p className="mt-1 text-gray-400 text-xs">
								This webhook hasn't been triggered yet
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
