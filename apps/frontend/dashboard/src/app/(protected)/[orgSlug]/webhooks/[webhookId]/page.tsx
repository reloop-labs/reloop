"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { useParams } from "next/navigation";
import * as React from "react";
import useSWR from "swr";
import { DeliveryLogs } from "./components/delivery-logs";
import { EventSubscriptions } from "./components/event-subscriptions";
import { WebhookHeader } from "./components/webhook-header";
import { WebhookOverview } from "./components/webhook-overview";
import { WebhookSettings } from "./components/webhook-settings";

interface WebhookData {
	id: string;
	name: string;
	url: string;
	secret: string | null;
	status: "active" | "paused" | "disabled" | "failed";
	customHeaders: Record<string, string> | null;
	rateLimitEnabled: boolean;
	maxRequestsPerMinute: number;
	maxRetries: number;
	retryBackoffMultiplier: number;
	filteringOptions: Record<string, unknown> | null;
	lastTriggeredAt: string | null;
	successCount: number;
	failureCount: number;
	consecutiveFailures: number;
	createdAt: string;
	updatedAt: string;
}

const WebhookDetailPage = () => {
	const { webhookId } = useParams();
	const [activeTab, setActiveTab] = React.useState("overview");

	const {
		data: webhookData,
		error,
		isLoading,
	} = useSWR<WebhookData>(webhookId ? `/api/webhook/v1/${webhookId}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	if (error) {
		return (
			<div className="mx-auto max-w-6xl">
				<SomethingWentWrong />
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="mx-auto max-w-6xl">
				<div className="animate-pulse">
					<div className="mb-4 h-8 w-1/3 rounded bg-gray-200" />
					<div className="mb-8 h-4 w-1/2 rounded bg-gray-200" />
					<div className="space-y-4">
						<div className="h-4 rounded bg-gray-200" />
						<div className="h-4 w-3/4 rounded bg-gray-200" />
						<div className="h-4 w-1/2 rounded bg-gray-200" />
					</div>
				</div>
			</div>
		);
	}

	if (!webhookData) {
		return (
			<div className="mx-auto max-w-6xl">
				<div className="py-12 text-center">
					<h2 className="mb-2 font-semibold text-2xl text-gray-900">
						Webhook not found
					</h2>
					<p className="text-gray-500">
						The webhook you're looking for doesn't exist or has been deleted.
					</p>
				</div>
			</div>
		);
	}

	const tabs = [
		{ id: "overview", label: "Overview" },
		{ id: "events", label: "Events" },
		{ id: "deliveries", label: "Deliveries" },
		{ id: "settings", label: "Settings" },
	];

	return (
		<div className="mx-auto max-w-6xl">
			<WebhookHeader webhook={webhookData} />

			<div className="mt-8">
				<TabMenu.Root value={activeTab} onValueChange={setActiveTab}>
					<TabMenu.List>
						{tabs.map((tab) => (
							<TabMenu.Trigger key={tab.id} value={tab.id}>
								{tab.label}
							</TabMenu.Trigger>
						))}
					</TabMenu.List>
				</TabMenu.Root>

				<div className="mt-6">
					{activeTab === "overview" && (
						<WebhookOverview webhook={webhookData} />
					)}
					{activeTab === "events" && (
						<EventSubscriptions webhookId={webhookData.id} />
					)}
					{activeTab === "deliveries" && (
						<DeliveryLogs webhookId={webhookData.id} />
					)}
					{activeTab === "settings" && (
						<WebhookSettings webhook={webhookData} />
					)}
				</div>
			</div>
		</div>
	);
};

export default WebhookDetailPage;
