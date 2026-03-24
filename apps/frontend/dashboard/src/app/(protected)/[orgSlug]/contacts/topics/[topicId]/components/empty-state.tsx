"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onAddContact: () => void;
}

export const EmptyState = ({ onAddContact }: EmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center py-16">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-weak-50">
				<Icon name="user-plus" className="h-8 w-8 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-medium text-lg">No contacts yet</h3>
			<p className="mb-6 max-w-sm text-center text-sm text-text-sub-600">
				Add contacts to this topic to start managing their subscriptions.
			</p>
			<Button.Root variant="neutral" size="small" onClick={onAddContact}>
				<Icon name="plus" className="h-4 w-4" />
				Add first contact
			</Button.Root>
		</div>
	);
};
