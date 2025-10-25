"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { AudienceGroupListResponse } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { DeleteAudienceGroupModal } from "../../components/delete-audience-group";
import { AudienceGroupTable } from "./audience-group-table";
import { EmptyState } from "./empty-state";

export const AudienceGroupListSidebar = () => {
	const { activeOrganization } = useUserOrganization();
	const [searchQuery, setSearchQuery] = useState<string>("");

	const { data, error, isLoading } = useSWR<AudienceGroupListResponse>(
		activeOrganization?.id
			? `/api/audience/v1/audience-groups?organizationId=${activeOrganization.id}&limit=100`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	// Filter groups based on search query
	const filteredGroups =
		data?.audienceGroups?.filter((group) => {
			const matchesSearch =
				searchQuery === "" ||
				group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(group.description &&
					group.description.toLowerCase().includes(searchQuery.toLowerCase()));
			return matchesSearch;
		}) || [];

	return (
		<div className="mx-auto max-w-3xl">
			<div className="flex items-center justify-between pt-10">
				<p className="font-medium text-2xl">
					Audience Group{data?.audienceGroups.length !== 1 ? "s" : ""}
				</p>
				<div className="flex items-center gap-2">
					<Link
						className={Button.buttonVariants({
							variant: "neutral",
							size: "xsmall",
						}).root()}
						href={`/${activeOrganization.slug}/audience/add`}
					>
						<Icon name="plus" className="h-4 w-4" />
						Create group
					</Link>
				</div>
			</div>
			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load audience groups
						</p>
					</div>
				) : data?.audienceGroups && data.audienceGroups.length === 0 ? (
					<EmptyState />
				) : (
					<div>
						<div className="mt-10 flex items-center gap-3">
							<div className="flex-1">
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Icon
											as={() => <Icon name="search" className="h-4 w-4" />}
										/>
										<Input.Input
											type="text"
											placeholder="Search groups..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>
						<div className="mt-4">
							<AudienceGroupTable
								audienceGroups={filteredGroups}
								activeOrganizationSlug={activeOrganization.slug}
								isLoading={isLoading}
								loadingRows={4}
							/>
						</div>
					</div>
				)}
			</div>
			<DeleteAudienceGroupModal audienceGroups={data?.audienceGroups || []} />
		</div>
	);
};
