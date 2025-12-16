"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { DeliveryLogs } from "./components/delivery-logs";
import { WebhookHeader } from "./components/webhook-header";

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
			<div className="mx-auto max-w-3xl sm:px-8">
				<SomethingWentWrong />
			</div>
		);
	}

	if (!webhookData) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
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

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<WebhookHeader
				webhook={webhookData}
				isLoading={isLoading}
				isFailed={!!error}
				onDeleteWebhook={() => { }}
			/>

			<DeliveryLogs webhookId={webhookData.id} />
		</div>
	);
};

export default WebhookDetailPage;
