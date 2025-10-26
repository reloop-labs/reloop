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
		<div className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
			<div className="flex items-start justify-between">
				<div className="min-w-0 flex-1">
					<div className="mb-2 flex items-center gap-2">
						<h3 className="truncate font-medium text-gray-900">
							{webhook.name}
						</h3>
						<Badge.Root
							className={cn(
								"border font-medium text-xs",
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
					<p className="mb-3 truncate text-gray-500 text-sm">{webhook.url}</p>
					<div className="flex items-center gap-4 text-gray-500 text-xs">
						<div className="flex items-center gap-1">
							<Icon name="check" className="h-3 w-3 text-green-500" />
							<span>{webhook.successCount} success</span>
						</div>
						<div className="flex items-center gap-1">
							<Icon name="x" className="h-3 w-3 text-red-500" />
							<span>{webhook.failureCount} failed</span>
						</div>
						<div className="flex items-center gap-1">
							<Icon name="trending-up" className="h-3 w-3 text-blue-500" />
							<span>{successRate}% success rate</span>
						</div>
					</div>
					{webhook.lastTriggeredAt && (
						<p className="mt-2 text-gray-400 text-xs">
							Last triggered {dayjs(webhook.lastTriggeredAt).fromNow()}
						</p>
					)}
				</div>
				<Icon
					name="chevron-right"
					className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600"
				/>
			</div>
		</div>
	);
};
