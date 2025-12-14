import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

export const EmptyState = () => {
	const { activeOrganization } = useUserOrganization();

	return (
		<div>
			<div className="flex h-[calc(100dvh-400px)] items-center justify-center">
				<div className="flex flex-col items-center justify-center gap-4">
					<Icon name="globe" className="h-12 w-12" />
					<div>
						<p className="text-center font-semibold text-2xl">No domains yet</p>
						<p className="max-w-72 text-center text-paragraph-sm text-text-sub-600">
							Add your first domain to begin sending emails from your custom
							domain.
						</p>
					</div>
					<Link
						href={`/${activeOrganization.slug}/domain/add`}
						className={Button.buttonVariants({
							variant: "neutral",
							size: "small",
						}).root()}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add domain
					</Link>
				</div>
			</div>
		</div>
	);
};
