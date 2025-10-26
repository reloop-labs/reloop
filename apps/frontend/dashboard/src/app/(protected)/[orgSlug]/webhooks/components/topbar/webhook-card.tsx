"use client";
import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface WebhookCardProps {
	webhook: {
		id: string;
		name: string;
		url: string;
		status: "active" | "paused" | "disabled" | "failed";
		successCount: number;
		failureCount: number;
		lastTriggeredAt: string | null;
		createdAt: string;
	};
}

const getStatusColor = (status: string) => {
	switch (status) {
		case "active":
			return "bg-green-100 text-green-800 border-green-200";
		case "paused":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "disabled":
			return "bg-gray-100 text-gray-800 border-gray-200";
		case "failed":
			return "bg-red-100 text-red-800 border-red-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

const getStatusIcon = (status: string) => {
	switch (status) {
		case "active":
			return "check-circle";
		case "paused":
			return "pause-circle";
		case "disabled":
			return "x-circle";
		case "failed":
			return "alert-circle";
		default:
			return "circle";
	}
};

export const WebhookCard = ({ webhook }: WebhookCardProps) => {
	const successRate =
		webhook.successCount + webhook.failureCount > 0
			? Math.round(
					(webhook.successCount /
						(webhook.successCount + webhook.failureCount)) *
						100,
				)
			: 0;

	return (
		<div className="group h-full cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
			<div className="flex h-full flex-col">
				<div className="mb-3 flex items-start justify-between">
					<div className="min-w-0 flex-1">
						<h3 className="truncate font-medium text-gray-900">
							{webhook.name}
						</h3>
						<p className="mt-1 truncate text-gray-500 text-sm">{webhook.url}</p>
					</div>
					<Badge.Root
						className={cn(
							"flex-shrink-0 border font-medium text-xs",
							getStatusColor(webhook.status),
						)}
					>
						<Icon
							name={getStatusIcon(webhook.status)}
							className="mr-1 h-3 w-3"
						/>
						{webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
					</Badge.Root>
				</div>

				<div className="flex-1">
					<div className="mb-4 grid grid-cols-3 gap-3">
						<div className="text-center">
							<div className="font-semibold text-green-600 text-lg">
								{webhook.successCount}
							</div>
							<div className="text-gray-500 text-xs">Success</div>
						</div>
						<div className="text-center">
							<div className="font-semibold text-lg text-red-600">
								{webhook.failureCount}
							</div>
							<div className="text-gray-500 text-xs">Failed</div>
						</div>
						<div className="text-center">
							<div className="font-semibold text-blue-600 text-lg">
								{successRate}%
							</div>
							<div className="text-gray-500 text-xs">Success Rate</div>
						</div>
					</div>

					{webhook.lastTriggeredAt && (
						<p className="text-center text-gray-400 text-xs">
							Last triggered {dayjs(webhook.lastTriggeredAt).fromNow()}
						</p>
					)}
				</div>

				<div className="mt-4 flex items-center justify-end">
					<Icon
						name="chevron-right"
						className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600"
					/>
				</div>
			</div>
		</div>
	);
};
