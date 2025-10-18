import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { EmptyState } from "./empty-state";
export const DomainListSidebar = () => {
	const { activeOrganization } = useUserOrganization();
	return (
		<div>
			<div className="flex h-12 items-center justify-between border-stroke-soft-100 border-b px-2">
				<div className="flex items-center gap-2">
					<div>Status</div>
				</div>
				<Link
					className={Button.buttonVariants({
						variant: "neutral",
						size: "xsmall",
					}).root()}
					href={`/${activeOrganization.slug}/domain/add`}
				>
					<Icon name="plus" className="h-4 w-4" />
					Add domain
				</Link>
			</div>
			<div>
				<EmptyState />
			</div>
		</div>
	);
};
