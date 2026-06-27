"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import { DeleteWebhookModal } from "../components/delete-webhook-modal";
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
	const getBackToUrl = useGetBackToUrl();
	const { webhookId } = useParams();
	const router = useRouter();
	const [, setDeleteId] = useQueryState("delete");
	const { activeOrganization } = useUserOrganization();

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
			<div className="mx-auto w-full max-w-6xl px-6">
				<p>dd</p>
			</div>
		);
	}

	if (!webhookData && !isLoading) {
		return (
			<div className="mx-auto w-full max-w-6xl px-6">
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
		<div className="mx-auto w-full max-w-6xl px-6">
			<WebhookHeader
				webhook={webhookData ?? null}
				isLoading={isLoading}
				isFailed={!!error}
				onDeleteWebhook={() => {
					if (webhookData) setDeleteId(webhookData.id);
				}}
				onTriggerTest={() =>
					router.push(getBackToUrl(`/webhooks/${webhookId as string}/test`))
				}
			/>

			<DeliveryLogs webhookId={webhookData?.id ?? (webhookId as string)} />

			{webhookData && (
				<DeleteWebhookModal
					webhook={webhookData}
					onSuccess={() => {
						if (activeOrganization?.slug) {
							router.push("/webhooks");
						}
					}}
				/>
			)}
		</div>
	);
};

export default WebhookDetailPage;
