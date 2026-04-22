"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

interface EmptyStateProps {
	onAddDomain?: () => void;
}

export const EmptyState = ({ onAddDomain }: EmptyStateProps) => {
	const { activeOrganization } = useUserOrganization();

	return (
		<div className="flex flex-col items-center border-stroke-soft-100 bg-bg-soft-200/10 px-6 py-12 text-center dark:border-stroke-soft-100/50 dark:bg-bg-soft-200/15">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon name="globe" className="h-5 w-5 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				No domains yet
			</h3>
			<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
				Add a custom domain to send emails and improve your deliverability.
			</p>
			<div className="flex items-center gap-3">
				{onAddDomain ? (
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={onAddDomain}
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Icon name="plus" className="h-4 w-4" />
						Add Domain
					</Button.Root>
				) : (
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link href={`/domain/add`}>
							<Icon name="plus" className="h-4 w-4" />
							Add Domain
						</Link>
					</Button.Root>
				)}
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					asChild
					className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
				>
					<a
						href="https://reloop.sh/docs/domains"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon name="book-open" className="h-3.5 w-3.5" />
						Read the docs
					</a>
				</Button.Root>
			</div>
		</div>
	);
};
