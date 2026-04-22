"use client";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { TriggerWebhookTester } from "../../components/trigger-webhook-tester";

interface WebhookData {
	id: string;
	name: string;
	url: string;
	status: "active" | "paused" | "disabled" | "failed";
	createdAt: string;
	events: string[];
}

const getStatusIconColor = (status: string) => {
	switch (status) {
		case "active":
			return "text-success-base";
		case "paused":
			return "text-warning-base";
		case "failed":
			return "text-error-base";
		default:
			return "text-text-sub-600";
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

const WebhookTestPage = () => {
	const { webhookId } = useParams();
	const router = useRouter();

	const { data: webhookData, isLoading } = useSWR<WebhookData>(
		webhookId ? `/api/webhook/v1/${webhookId}` : null,
		{ revalidateOnFocus: false },
	);

	const displayName =
		webhookData?.name || webhookData?.url || "Unnamed Webhook";

	return (
		<div className="mx-auto mb-10 w-full max-w-4xl space-y-6">
			{/* Header — matches webhook-header.tsx pattern */}
			<div className="pt-6">
				<AnimatedBackButton
					onClick={() => router.push(`/webhooks/${webhookId as string}`)}
				/>

				<div className="flex items-center justify-between pt-4">
					<div>
						{/* Breadcrumb */}
						{isLoading ? (
							<div className="flex items-center gap-1.5">
								<Skeleton className="h-4 w-12 rounded-full" />
								<Skeleton className="h-1 w-1 rounded-full" />
								<Skeleton className="h-4 w-20 rounded-full" />
								<Skeleton className="h-1 w-1 rounded-full" />
								<Skeleton className="h-4 w-16 rounded-full" />
							</div>
						) : (
							<div className="flex items-center gap-1.5">
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									Webhook
								</p>
								<p className="font-semibold text-paragraph-xs text-text-sub-600">
									•
								</p>
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									{webhookData?.createdAt
										? formatRelativeTime(webhookData.createdAt)
										: "---"}
								</p>
								<p className="font-semibold text-paragraph-xs text-text-sub-600">
									•
								</p>
								<div
									className={`flex items-center gap-1 ${getStatusIconColor(webhookData?.status ?? "")}`}
								>
									<Icon
										name={getStatusIcon(webhookData?.status ?? "")}
										className="h-3.5 w-3.5"
									/>
									<p className="font-medium text-paragraph-xs capitalize">
										{webhookData?.status ?? "Unknown"}
									</p>
								</div>
							</div>
						)}

						{/* Title */}
						{isLoading ? (
							<div className="mt-2 flex flex-col gap-1.5">
								<Skeleton className="h-7 w-48 rounded-lg" />
								<Skeleton className="h-4 w-64 rounded-lg" />
							</div>
						) : (
							<div className="mt-1 flex flex-col gap-1">
								<h1 className="font-semibold text-text-strong-950 text-title-h6 leading-8">
									{displayName}
								</h1>
								<div className="flex items-center gap-1.5 truncate font-medium font-mono text-paragraph-sm text-text-sub-600">
									{webhookData?.url}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Tester body */}
			<div>
				{!isLoading && webhookData && (
					<TriggerWebhookTester
						webhookId={webhookData.id}
						webhookEvents={webhookData.events}
					/>
				)}
			</div>
		</div>
	);
};

export default WebhookTestPage;
