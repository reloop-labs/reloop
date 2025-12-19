"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import useSWR from "swr";
import { CreateTopicModal } from "./create-topic-modal";
import { DeleteTopicModal } from "./delete-topic";
import { EmptyState } from "./empty-state";
import { TopicTable } from "./topic-table";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface TopicListResponse {
	topics: Topic[];
	total: number;
	page: number;
	limit: number;
}

interface TopicListProps {
	hideHeader?: boolean;
}

export const TopicList = ({ hideHeader = false }: TopicListProps) => {
	const { activeOrganization } = useUserOrganization();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const { data, error, isLoading } = useSWR<TopicListResponse>(
		activeOrganization?.id
			? `/api/contacts/v1/topics/list?limit=${pageSize}&page=${currentPage}`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	// Filter topics based on search query
	const filteredTopics =
		data?.topics?.filter((topic) => {
			const matchesSearch =
				searchQuery === "" ||
				topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				topic.description?.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesSearch;
		}) || [];

	return (
		<div className={hideHeader ? "" : "mx-auto max-w-3xl sm:px-8"}>
			{!hideHeader && (
				<div className="flex items-center justify-between pt-10">
					<p className="font-medium text-2xl">
						Topic{data?.topics.length !== 1 ? "s" : ""}
					</p>
					<div className="flex items-center gap-2">
						<Button.Root
							variant="neutral"
							size="xsmall"
							onClick={() => setIsCreateModalOpen(true)}
						>
							<Icon name="plus" className="h-4 w-4" />
							Create topic
						</Button.Root>
					</div>
				</div>
			)}
			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load topics
						</p>
					</div>
				) : data?.topics && data.topics.length === 0 ? (
					<EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
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
											placeholder="Search topics..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>
						<div className="mt-4">
							<TopicTable
								topics={filteredTopics}
								activeOrganizationSlug={activeOrganization.slug}
								isLoading={isLoading}
								loadingRows={4}
							/>
						</div>

						{/* Pagination */}
						{data && data.total > 0 && (
							<div className="mt-4 flex items-center justify-between pb-8 text-paragraph-sm text-text-sub-600">
								<div className="flex items-center gap-3">
									<span>
										Showing {startIndex}–{endIndex} of {data.total} topic
										{data.total !== 1 ? "s" : ""}
									</span>
									<PageSizeDropdown
										value={pageSize}
										onValueChange={(value) => {
											setPageSize(value);
											setCurrentPage(1);
										}}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Button.Root
										variant="neutral"
										mode="stroke"
										size="xxsmall"
										onClick={() =>
											setCurrentPage((prev) => Math.max(1, prev - 1))
										}
										disabled={currentPage === 1 || isLoading}
										className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
									>
										<Icon name="chevron-left" className="h-4 w-4" />
									</Button.Root>
									<span className="px-2">
										Page {currentPage} of {totalPages}
									</span>
									<Button.Root
										variant="neutral"
										mode="stroke"
										size="xxsmall"
										onClick={() =>
											setCurrentPage((prev) => Math.min(totalPages, prev + 1))
										}
										disabled={currentPage === totalPages || isLoading}
										className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
									>
										<Icon name="chevron-right" className="h-4 w-4" />
									</Button.Root>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
			<DeleteTopicModal topics={data?.topics || []} />
			<CreateTopicModal
				open={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
			/>
		</div>
	);
};
