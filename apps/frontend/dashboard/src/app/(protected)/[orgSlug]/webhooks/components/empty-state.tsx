"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onCreateWebhook: () => void;
}

export const EmptyState = ({ onCreateWebhook }: EmptyStateProps) => {
	return (
		<div className="w-full overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-surface-0 dark:border-stroke-soft-100/50">
			{/* Top Hero Section */}
			<div className="flex flex-col items-center border-stroke-soft-100 border-b px-6 py-16 text-center dark:border-stroke-soft-100/50">
				<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-stroke-soft-100/50">
					<Icon name="webhook" className="h-8 w-8 text-text-sub-600" />
				</div>
				<h3 className="mb-3 font-semibold text-text-strong-950 text-xl">
					No webhooks yet
				</h3>
				<p className="mx-auto mb-8 max-w-[520px] text-balance text-sm text-text-sub-600 leading-relaxed">
					Connect your app to real-time events. When something happens in your
					account, we'll instantly POST a signed payload to your URL.
				</p>
				<div className="flex items-center gap-4">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={onCreateWebhook}
						className="gap-2 rounded-xl border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Icon name="plus" className="h-4 w-4" />
						Create your first webhook
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						asChild
						className="gap-2 rounded-xl border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<a
							href="https://reloop.sh/docs/webhooks"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="book-open" className="h-4 w-4" />
							Read the docs
						</a>
					</Button.Root>
				</div>
			</div>

			{/* Bottom Details Section */}
			<div className="grid grid-cols-1 md:grid-cols-2">
				{/* Left Column: How it works */}
				<div className="border-stroke-soft-100 border-r p-8 md:p-10 dark:border-stroke-soft-100/50">
					<h4 className="mb-8 font-semibold text-text-strong-950">
						How it works
					</h4>
					<div className="relative flex flex-col gap-8">
						{/* Step 1 */}
						<div className="relative flex gap-5">
							{/* Connecting line */}
							<div className="absolute top-8 bottom-[-32px] left-[13px] w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/50" />
							<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-surface-0 text-text-sub-600 text-xs dark:border-stroke-soft-100/50">
								1
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Register an endpoint
								</h5>
								<p className="mt-1 text-balance text-sm text-text-sub-600 leading-relaxed">
									Provide a public HTTPS URL that can receive POST requests.
								</p>
							</div>
						</div>
						{/* Step 2 */}
						<div className="relative flex gap-5">
							<div className="absolute top-8 bottom-[-32px] left-[13px] w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/50" />
							<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-surface-0 text-text-sub-600 text-xs dark:border-stroke-soft-100/50">
								2
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Subscribe to events
								</h5>
								<p className="mt-1 text-balance text-sm text-text-sub-600 leading-relaxed">
									Choose which events trigger a delivery — orders, payments,
									users.
								</p>
							</div>
						</div>
						{/* Step 3 */}
						<div className="relative flex gap-5">
							<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-surface-0 text-text-sub-600 text-xs dark:border-stroke-soft-100/50">
								3
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Receive & verify
								</h5>
								<p className="mt-1 text-balance text-sm text-text-sub-600 leading-relaxed">
									Validate the HMAC signature on each request, then act on it.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: What you can do */}
				<div className="p-8 md:p-10">
					<h4 className="mb-8 font-semibold text-text-strong-950">
						What you can do
					</h4>
					<div className="flex flex-col">
						{/* Item 1 */}
						<div className="mb-6 flex gap-5 border-stroke-soft-100 border-b pb-6 dark:border-stroke-soft-100/50">
							<div className="mt-0.5 shrink-0">
								<Icon name="activity" className="h-5 w-5 text-text-sub-600" />
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Real-time delivery logs
								</h5>
								<p className="mt-1 text-balance text-sm text-text-sub-600 leading-relaxed">
									Inspect every request and response with full payload
									visibility.
								</p>
							</div>
						</div>
						{/* Item 2 */}
						<div className="mb-6 flex gap-5 border-stroke-soft-100 border-b pb-6 dark:border-stroke-soft-100/50">
							<div className="mt-0.5 shrink-0">
								<Icon name="refresh-cw" className="h-5 w-5 text-text-sub-600" />
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Automatic retries
								</h5>
								<p className="mt-1 text-balance text-sm text-text-sub-600 leading-relaxed">
									Failed deliveries retry with exponential backoff — up to 3
									attempts.
								</p>
							</div>
						</div>
						{/* Item 3 */}
						<div className="flex gap-5">
							<div className="mt-0.5 shrink-0">
								<Icon name="lock" className="h-5 w-5 text-text-sub-600" />
							</div>
							<div>
								<h5 className="font-medium text-sm text-text-strong-950">
									Signed payloads
								</h5>
								<p className="mt-1 text-balance text-sm text-text-sub-600 leading-relaxed">
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
