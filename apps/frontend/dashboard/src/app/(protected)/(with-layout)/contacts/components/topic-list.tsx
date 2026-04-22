"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";

import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { TopicTable } from "./topic-table";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
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

export const TopicList = () => {
	const { activeOrganization } = useUserOrganization();
	const { mutate } = useSWRConfig();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [, setId] = useQueryState("id", { history: "replace" });
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

	const handleToggleVisibility = async (
		topicId: string,
		currentValue: "private" | "public",
	) => {
		const newValue = currentValue === "public" ? "private" : "public";
		try {
			const response = await fetch(`/api/contacts/v1/topics/${topicId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ visibility: newValue }),
			});
			if (!response.ok) throw new Error("Failed to update visibility");
			toast.success(`Visibility set to ${newValue}`);
			mutate(
				(key: string) =>
					typeof key === "string" && key.startsWith("/api/contacts/v1/topics"),
			);
		} catch {
			toast.error("Failed to update visibility");
		}
	};

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load topics
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="xsmall" className="rounded-[10px]">
						<Input.Wrapper>
							<Input.Icon
								as={Icon}
								name="search"
								size="xsmall"
								className="h-3.5 w-3.5"
							/>
							<Input.Input
								placeholder="Search topics..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
			</div>

			<div className="mt-4">
				<TopicTable
					topics={filteredTopics}
					isLoading={isLoading}
					loadingRows={4}
					onToggleVisibility={handleToggleVisibility}
					onEdit={(topicId) => {
						setModal("edit-topic");
						setId(topicId);
					}}
					onDelete={(topicId) => {
						setModal("delete-topic");
						setId(topicId);
					}}
					onAddTopic={() => setModal("create-topic")}
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
					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						isLoading={isLoading}
					/>
				</div>
			)}
		</div>
	);
};
