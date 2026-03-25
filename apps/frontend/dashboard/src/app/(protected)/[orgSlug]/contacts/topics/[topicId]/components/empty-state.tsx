"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onAddContact: () => void;
}

export const EmptyState = ({ onAddContact }: EmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center px-4 py-12 text-center">
			<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-weak-50">
				<Icon name="user-plus" className="h-6 w-6 text-text-sub-600" />
			</div>
			<h3 className="mb-1 font-semibold text-lg text-text-strong-950">
				No contacts yet
			</h3>
			<p className="mb-6 max-w-[280px] font-normal text-sm text-text-sub-600">
				Add contacts to this topic to start managing their subscriptions.
			</p>
			<Button.Root variant="neutral" size="xsmall" onClick={onAddContact}>
				<Icon name="plus" className="h-4 w-4" />
				Add first contact
			</Button.Root>
			<a
				href="https://reloop.sh/docs/contacts"
				target="_blank"
				rel="noopener noreferrer"
				className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
			>
				<Icon name="book-closed" className="h-3 w-3" />
				Learn more about contacts
			</a>
		</div>
	);
};
