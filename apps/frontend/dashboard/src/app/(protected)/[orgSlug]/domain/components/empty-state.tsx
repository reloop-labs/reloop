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
		<div className="flex flex-col items-center justify-center px-4 py-12 text-center">
			<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-weak-50">
				<Icon name="globe" className="h-6 w-6 text-text-sub-600" />
			</div>
			<h3 className="mb-1 font-semibold text-lg text-text-strong-950">
				No domains yet
			</h3>
			<p className="mb-6 max-w-[280px] font-normal text-sm text-text-sub-600">
				Add your first domain to begin sending emails from your custom domain.
			</p>

			{onAddDomain ? (
				<Button.Root variant="neutral" size="xsmall" onClick={onAddDomain}>
					<Icon name="plus" className="h-4 w-4" />
					Add your first domain
				</Button.Root>
			) : (
				<Link
					href={`/${activeOrganization.slug}/domain/add`}
					className={Button.buttonVariants({
						variant: "neutral",
						size: "xsmall",
					}).root()}
				>
					<Icon name="plus" className="h-4 w-4" />
					Add your first domain
				</Link>
			)}

			<a
				href="https://reloop.sh/docs/domains"
				target="_blank"
				rel="noopener noreferrer"
				className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
			>
				<Icon name="book-closed" className="h-3 w-3" />
				Learn more about custom domains
			</a>
		</div>
	);
};
