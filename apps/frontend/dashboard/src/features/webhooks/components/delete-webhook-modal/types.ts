export interface WebhookData {
	id: string;
	name: string;
	url: string;
	status: "active" | "paused" | "disabled" | "failed";
	successCount: number;
	failureCount: number;
	lastTriggeredAt: string | null;
	createdAt: string;
	events?: string[];
}

export interface DeleteWebhookModalProps {
	webhook?: WebhookData | null;
	onSuccess?: (deletedName?: string) => void;
}
