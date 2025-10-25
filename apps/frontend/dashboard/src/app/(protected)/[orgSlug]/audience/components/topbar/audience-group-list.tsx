"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { AudienceGroupListResponse } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Table from "@reloop/ui/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

// Initialize dayjs with relative time plugin
dayjs.extend(relativeTime);

export const AudienceGroupListTopbar = () => {
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

	if (isLoading) {
		return (
			<div className="mx-auto max-w-6xl p-6">
				<div className="mb-6 flex items-center justify-between">
					<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
					<div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
				</div>
				<div className="space-y-4">
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className="h-16 w-full animate-pulse rounded bg-gray-200"
						/>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-6xl p-6">
				<div className="flex flex-col items-center justify-center gap-4 py-12">
					<Icon name="alert-circle" className="h-12 w-12 text-red-500" />
					<div className="text-center">
						<h3 className="font-medium text-lg">
							Failed to load audience groups
						</h3>
						<p className="text-sm text-text-sub-600">
							There was an error loading your audience groups. Please try again.
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!data?.audienceGroups?.length) {
		return (
			<div className="mx-auto max-w-6xl p-6">
				<div className="flex flex-col items-center justify-center gap-4 py-12">
					<Icon name="users" className="h-12 w-12 text-gray-400" />
					<div className="text-center">
						<h3 className="font-medium text-lg">No audience groups yet</h3>
						<p className="text-sm text-text-sub-600">
							Create your first audience group to start organizing your
							audiences.
						</p>
					</div>
					<Link
						href={`/${activeOrganization?.slug}/audience/add`}
						className={Button.buttonVariants({
							variant: "neutral",
							size: "small",
						}).root()}
					>
						<Icon name="plus" className="h-4 w-4" />
						Create Audience Group
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="font-medium text-2xl">
						Audience Group{data.audienceGroups.length !== 1 ? "s" : ""}
					</h1>
					<p className="text-sm text-text-sub-600">
						Manage your audience groups and organize your audiences.
					</p>
				</div>
				<Link
					href={`/${activeOrganization?.slug}/audience/add`}
					className={Button.buttonVariants({
						variant: "neutral",
						size: "small",
					}).root()}
				>
					<Icon name="plus" className="h-4 w-4" />
					Create Audience Group
				</Link>
			</div>

			<div className="mb-6">
				<Input.Root>
					<Input.Wrapper size="small">
						<Input.Icon>
							<Icon name="search" className="h-4 w-4" />
						</Input.Icon>
						<Input.Input
							placeholder="Search audience groups..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			<div className="rounded-lg border border-stroke-soft-200">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Description</Table.Head>
							<Table.Head>Audiences</Table.Head>
							<Table.Head>Created</Table.Head>
							<Table.Head className="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{filteredGroups.map((group) => (
							<Table.Row key={group.id}>
								<Table.Cell>
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
											<Icon name="users" className="h-4 w-4 text-blue-600" />
										</div>
										<div>
											<div className="font-medium">{group.name}</div>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div className="text-sm text-text-sub-600">
										{group.description || "No description"}
									</div>
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-2">
										<span className="font-medium">{group.audienceCount}</span>
										<span className="text-sm text-text-sub-600">audiences</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div className="text-sm text-text-sub-600">
										{dayjs(group.createdAt).fromNow()}
									</div>
								</Table.Cell>
								<Table.Cell className="text-right">
									<div className="flex items-center justify-end gap-2">
										<Link
											href={`/${activeOrganization?.slug}/audience/${group.id}`}
											className={Button.buttonVariants({
												variant: "ghost",
												size: "xsmall",
											}).root()}
										>
											<Icon name="eye" className="h-4 w-4" />
											View
										</Link>
										<Button.Root
											variant="ghost"
											size="xsmall"
											onClick={() => {
												// Handle edit
											}}
										>
											<Icon name="edit" className="h-4 w-4" />
											Edit
										</Button.Root>
										<Button.Root
											variant="ghost"
											size="xsmall"
											onClick={() => {
												// Handle delete
											}}
										>
											<Icon name="trash" className="h-4 w-4" />
											Delete
										</Button.Root>
									</div>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	);
};
