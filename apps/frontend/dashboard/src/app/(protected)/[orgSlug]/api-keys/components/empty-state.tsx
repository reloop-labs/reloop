"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onCreateApiKey: () => void;
}

export const EmptyState = ({ onCreateApiKey }: EmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center h-[calc(100dvh-150px)]">
			{/* Illustration */}
			<div className="relative mb-8">
				{/* Background decorative elements */}
				<div className="absolute -top-3 -left-3 h-16 w-16 rounded-full bg-neutral-alpha-10" />
				<div className="absolute -right-2 -bottom-2 h-12 w-12 rounded-full bg-neutral-alpha-10" />

				{/* Main icon container */}
				<div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-stroke-soft-200/50 bg-bg-white-0 shadow-regular-md">
					<Icon name="key-new" className="h-10 w-10 text-natural-base" />
				</div>
			</div>

			{/* Content */}
			<div className="flex max-w-md flex-col items-center text-center">
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No API keys yet
				</h3>
				<p className="mb-2 text-text-sub-600 text-sm">
					API keys allow you to authenticate requests to your application programmatically.
				</p>
				<p className="mb-6 text-text-soft-400 text-xs">
					Create your first API key to get started with the API.
				</p>

				{/* CTA */}
				<Button.Root variant="neutral" size="small" onClick={onCreateApiKey}>
					<Icon name="plus" className="h-4 w-4" />
					Create your first API key
				</Button.Root>

				{/* Help link */}
				<a
					href="https://reloop.sh/docs/api-keys"
					target="_blank"
					rel="noopener noreferrer"
					className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
				>
					<Icon name="book-closed" className="h-3 w-3" />
					Learn more about API keys
				</a>
			</div>
		</div>
	);
};
