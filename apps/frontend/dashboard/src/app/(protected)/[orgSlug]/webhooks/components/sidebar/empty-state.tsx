"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onCreateWebhook: () => void;
}

export const EmptyState = ({ onCreateWebhook }: EmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center px-4 py-12">
			<div className="mb-4 rounded-full bg-gray-100 p-6">
				<Icon name="webhook" className="h-12 w-12 text-gray-400" />
			</div>
			<h3 className="mb-2 font-medium text-gray-900 text-lg">
				No webhooks yet
			</h3>
			<p className="mb-6 max-w-sm text-center text-gray-500 text-sm">
				Create your first webhook to start receiving real-time events and
				notifications.
			</p>
			<Button.Root variant="neutral" size="small" onClick={onCreateWebhook}>
				<Icon name="plus" className="h-4 w-4" />
				Create webhook
			</Button.Root>
		</div>
	);
};
