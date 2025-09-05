"use client";

import { useOrgStore } from "@dashboard/store/use-org-store";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/components/avatar";
import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import * as Popover from "@reloop/ui/components/popover";
import { cn } from "@reloop/ui/utils/cn";
import useSWR from "swr";

export const OrganizationNavbar = () => {
	const { data, isLoading, error } = useSWR(
		"organization",
		async () => (await authClient.organization.list()).data,
	);
	const { setState } = useOrgStore();
	const { data: session } = authClient.useSession();
	const activeOrganization = session?.user.activeOrganizationId;
	const activeOrganizationData = data?.find(
		(organization) => organization.slug === activeOrganization,
	);

	return (
		<div className="flex items-center gap-2">
			<div className="flex items-center gap-2">
				<Avatar.Root color="purple" size="20" placeholderType="company" />
				<p>{activeOrganizationData?.name}</p>
			</div>
			<Popover.Root>
				<Popover.Trigger asChild>
					<Button.Root
						onClick={async () => {
							try {
								const organizations = await authClient.organization.list();
								console.log(organizations);
							} catch (error) {
								console.error(error);
							}
						}}
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="rotate-90"
					>
						<Icon name="code" className="h-3.5 w-3.5" />
					</Button.Root>
				</Popover.Trigger>
				<Popover.Content
					sideOffset={2}
					className="w-60 p-0"
					side="bottom"
					align="start"
				>
					<div className="px-2 pt-2">
						{data?.map((organization) => (
							<Button.Root
								variant="neutral"
								mode="ghost"
								key={organization.id}
								className={cn(
									"flex w-full justify-start px-2 py-0.5 font-normal",
									activeOrganizationData?.slug === organization.slug &&
										"bg-neutral-alpha-10 text-text-strong-950",
								)}
							>
								<div className="flex flex-1 items-center gap-2">
									<Avatar.Root
										color="purple"
										size="16"
										placeholderType="company"
									/>
									<p>{organization.name}</p>
								</div>
								<Icon
									name={
										activeOrganizationData?.slug === organization.slug
											? "check"
											: "chevron-right"
									}
									className="h-4 w-4"
								/>
							</Button.Root>
						))}
					</div>
					<div className="border-stroke-soft-200 px-2 pb-2">
						<Button.Root
							variant="neutral"
							mode="ghost"
							className="flex w-full justify-start px-2 py-0.5"
							onClick={() => setState(true)}
						>
							<Icon name="plus-outline" className="h-4 w-4" />
							Create Organization
						</Button.Root>
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>
	);
};
