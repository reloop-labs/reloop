"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

export const EmptyState = () => {
	const { activeOrganization } = useUserOrganization();

	return (
		<div className="flex flex-col items-center justify-center py-16">
			<div className="relative mb-4">
				<Icon name="globe" className="h-8 w-8 text-natural-base" />
			</div>

			{/* Content */}
			<div className="flex max-w-md flex-col items-center text-center">
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No domains yet
				</h3>
				<p className="mb-5 max-w-[270px] text-sm text-text-sub-600">
					Add your first domain to begin sending emails from your custom domain.
				</p>

				<Link
					href={`/${activeOrganization.slug}/domain/add`}
					className={Button.buttonVariants({
						variant: "neutral",
						size: "small",
					}).root()}
				>
					<Icon name="plus" className="h-4 w-4" />
					Add your first domain
				</Link>

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
		</div>
	);
};
