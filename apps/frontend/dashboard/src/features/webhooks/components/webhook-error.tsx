import { Icon } from "@reloop/ui/icon";

export const WebhookError = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-2 p-4">
			<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
			<p className="text-center text-sm text-text-sub-600">
				Failed to load webhooks
			</p>
		</div>
	);
};
