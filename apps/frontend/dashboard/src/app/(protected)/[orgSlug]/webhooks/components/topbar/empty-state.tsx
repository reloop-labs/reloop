"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onCreateWebhook: () => void;
}

export const EmptyState = ({ onCreateWebhook }: EmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<div className="rounded-full bg-gray-100 p-8 mb-6">
				<Icon name="webhook" className="h-16 w-16 text-gray-400" />
			</div>
			<h3 className="text-xl font-medium text-gray-900 mb-3">
				No webhooks yet
			</h3>
			<p className="text-sm text-gray-500 text-center mb-8 max-w-md">
				Create your first webhook to start receiving real-time events and notifications from your applications.
			</p>
			<Button.Root
				variant="primary"
				size="medium"
				onClick={onCreateWebhook}
			>
				<Icon name="plus" className="h-4 w-4 mr-2" />
				Create your first webhook
			</Button.Root>
		</div>
	);
};
