"use client";
import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface WebhookHeaderProps {
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

export const WebhookHeader = ({ webhook }: WebhookHeaderProps) => {
	const [copied, setCopied] = useState(false);
	const router = useRouter();

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy to clipboard");
		}
	};

	const successRate =
		webhook.successCount + webhook.failureCount > 0
			? Math.round(
					(webhook.successCount /
						(webhook.successCount + webhook.failureCount)) *
						100,
				)
			: 0;

	return (
		<div className="border-gray-200 border-b pb-6">
			<div className="flex items-start justify-between">
				<div className="min-w-0 flex-1">
					<div className="mb-2 flex items-center gap-3">
						<button
							type="button"
							onClick={() => router.back()}
							className="rounded-md p-1 transition-colors hover:bg-gray-100"
						>
							<Icon name="arrow-left" className="h-4 w-4 text-gray-500" />
						</button>
						<h1 className="truncate font-semibold text-2xl text-gray-900">
							{webhook.name}
						</h1>
						<Badge.Root
							className={cn(
								"border font-medium text-sm",
								getStatusColor(webhook.status),
							)}
						>
							<Icon
								name={getStatusIcon(webhook.status)}
								className="mr-1 h-4 w-4"
							/>
							{webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
						</Badge.Root>
					</div>

					<div className="mb-4 flex items-center gap-4 text-gray-500 text-sm">
						<div className="flex items-center gap-2">
							<Icon name="globe" className="h-4 w-4" />
							<span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">
								{webhook.url}
							</span>
							<button
								type="button"
								onClick={() => copyToClipboard(webhook.url)}
								className="rounded p-1 transition-colors hover:bg-gray-100"
								title="Copy URL"
							>
								<Icon
									name={copied ? "check" : "copy"}
									className="h-3 w-3 text-gray-400 hover:text-gray-600"
								/>
							</button>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-6">
						<div>
							<div className="font-semibold text-2xl text-green-600">
								{webhook.successCount}
							</div>
							<div className="text-gray-500 text-sm">Successful deliveries</div>
						</div>
						<div>
							<div className="font-semibold text-2xl text-red-600">
								{webhook.failureCount}
							</div>
							<div className="text-gray-500 text-sm">Failed deliveries</div>
						</div>
						<div>
							<div className="font-semibold text-2xl text-blue-600">
								{successRate}%
							</div>
							<div className="text-gray-500 text-sm">Success rate</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
