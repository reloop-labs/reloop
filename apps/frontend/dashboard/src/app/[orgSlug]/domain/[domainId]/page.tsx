"use client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import Link from "next/link";

const DomainPage = () => {
	const { activeOrganization } = useUserOrganization();
	return (
		<div className="mb-64 ">
			<div className="border-stroke-soft-100 border-b">
				<div className="mx-auto flex max-w-5xl items-center justify-between">
					<div className="flex items-center gap-4 py-10">
						<div>
							<h1 className="font-medium text-title-h4 ">Domain</h1>
						</div>
					</div>
					<Link
						className={Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()}
						href={`/${activeOrganization.slug}/domain/add`}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add domain
					</Link>
				</div>
			</div>
			<div className="mx-auto flex max-w-5xl">sdfklasdl</div>
		</div>
	);
};

export default DomainPage;
