"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onCreateWebhook: () => void;
}

export const EmptyState = ({ onCreateWebhook }: EmptyStateProps) => {
	return (
		<div className="w-full overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
			{/* Top Hero Section */}
			<div className="flex flex-col items-center border-stroke-soft-100 border-b bg-bg-soft-200/25 px-6 py-12 text-center dark:border-stroke-soft-100/50 dark:bg-bg-soft-200/15">
				<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
					<Icon name="webhook" className="h-5 w-5 text-text-sub-600" />
				</div>
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No webhooks yet
				</h3>
				<p className="mx-auto mb-6 max-w-[520px] text-balance text-sm text-text-sub-600">
					Connect your app to real-time events. When something happens in your
					account, we'll instantly POST a signed payload to your URL.
				</p>
				<div className="flex items-center gap-3">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={onCreateWebhook}
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Icon name="plus" className="h-3.5 w-3.5" />
						Create your first webhook
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<a
							href="https://reloop.sh/docs/webhooks"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="book-open" className="h-3.5 w-3.5" />
							Read the docs
						</a>
					</Button.Root>
				</div>
			</div>

			{/* Bottom Details Section */}
			<div className="grid grid-cols-1 md:grid-cols-2">
				{/* Left Column: How it works */}
				<div className="border-stroke-soft-100 border-r p-6 dark:border-stroke-soft-100/50">
					<h4 className="mb-3 font-medium text-sm text-text-strong-950">
						How it works
					</h4>
					<div className="relative flex flex-col gap-6">
						{/* Step 1 */}
						<div className="relative flex gap-4">
							{/* Connecting line */}
							<div className="absolute top-10 bottom-[-4px] left-[13px] w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/50" />
							<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-surface-0 font-medium text-text-sub-600 text-xs dark:border-stroke-soft-100/50">
								1
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Register an endpoint
								</h5>
								<p className="mt-0.5 text-balance text-sm text-text-sub-600">
									Provide a public HTTPS URL that can receive POST requests.
								</p>
							</div>
						</div>
						{/* Step 2 */}
						<div className="relative flex gap-4">
							<div className="absolute top-10 bottom-[-4px] left-[13px] w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/50" />
							<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-surface-0 font-medium text-text-sub-600 text-xs dark:border-stroke-soft-100/50">
								2
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Subscribe to events
								</h5>
								<p className="mt-0.5 text-balance text-sm text-text-sub-600">
									Choose which events trigger a delivery — orders, payments,
									users.
								</p>
							</div>
						</div>
						{/* Step 3 */}
						<div className="relative flex gap-4">
							<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-surface-0 font-medium text-text-sub-600 text-xs dark:border-stroke-soft-100/50">
								3
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Receive & verify
								</h5>
								<p className="mt-0.5 text-balance text-sm text-text-sub-600">
									Validate the HMAC signature on each request, then act on it.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: What you can do */}
				<div className="p-6">
					<h4 className="mb-3 font-medium text-sm text-text-strong-950">
						What you can do
					</h4>
					<div className="flex flex-col">
						{/* Item 1 */}
						<div className="mb-5 flex gap-4 border-stroke-soft-100 border-b pb-5 dark:border-stroke-soft-100/50">
							<div className="mt-0.5 shrink-0">
								<Icon name="activity" className="h-4 w-4 text-text-sub-600" />
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Real-time delivery logs
								</h5>
								<p className="mt-0.5 text-balance text-sm text-text-sub-600">
									Inspect every request and response with full payload
									visibility.
								</p>
							</div>
						</div>
						{/* Item 2 */}
						<div className="mb-5 flex gap-4 border-stroke-soft-100 border-b pb-5 dark:border-stroke-soft-100/50">
							<div className="mt-0.5 shrink-0">
								<Icon name="refresh-cw" className="h-4 w-4 text-text-sub-600" />
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Automatic retries
								</h5>
								<p className="mt-0.5 text-balance text-sm text-text-sub-600">
									Failed deliveries retry with exponential backoff — up to 3
									attempts.
								</p>
							</div>
						</div>
						{/* Item 3 */}
						<div className="flex gap-4">
							<div className="mt-0.5 shrink-0">
								<Icon name="lock" className="h-4 w-4 text-text-sub-600" />
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Signed payloads
								</h5>
								<p className="mt-0.5 text-balance text-sm text-text-sub-600">
									Every request is HMAC-SHA256 signed so you can verify it's
									really us.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
