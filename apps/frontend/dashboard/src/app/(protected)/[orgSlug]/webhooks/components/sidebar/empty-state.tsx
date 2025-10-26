"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onCreateWebhook: () => void;
}

export const EmptyState = ({ onCreateWebhook }: EmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-4">
			<div className="rounded-full bg-gray-100 p-6 mb-4">
				<Icon name="webhook" className="h-12 w-12 text-gray-400" />
			</div>
			<h3 className="text-lg font-medium text-gray-900 mb-2">
				No webhooks yet
			</h3>
			<p className="text-sm text-gray-500 text-center mb-6 max-w-sm">
				Create your first webhook to start receiving real-time events and notifications.
			</p>
			<Button.Root
				variant="primary"
				size="small"
				onClick={onCreateWebhook}
			>
				<Icon name="plus" className="h-4 w-4 mr-2" />
				Create your first webhook
			</Button.Root>
		</div>
	);
};
