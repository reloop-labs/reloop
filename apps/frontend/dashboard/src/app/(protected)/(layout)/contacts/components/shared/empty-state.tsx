"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface EmptyStateProps {
	onCreateClick?: () => void;
}

export const EmptyState = ({ onCreateClick }: EmptyStateProps) => {
	return (
		<div className="flex flex-col items-center border-stroke-soft-100 bg-bg-soft-200/10 px-6 py-12 text-center dark:border-stroke-soft-100/50 dark:bg-bg-soft-200/15">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon
					name="notification-indicator"
					className="h-5 w-5 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				No channels yet
			</h3>
			<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
				Organise contacts by interest so they only receive the messages they
				care about.
			</p>
			<div className="flex items-center gap-3">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={onCreateClick}
					className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create Channel
					<span className="inline-flex items-center gap-0.5">
						<Icon
							name="command"
							className="h-4 w-4 rounded-sm border border-stroke-soft-200 p-px"
						/>
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
							A
						</span>
					</span>
				</Button.Root>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					asChild
					className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
				>
					<a
						href="https://reloop.sh/docs/channels"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon name="file-text" className="h-3.5 w-3.5" />
						Learn about channels
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
							D
						</span>
					</a>
				</Button.Root>
			</div>
		</div>
	);
};
