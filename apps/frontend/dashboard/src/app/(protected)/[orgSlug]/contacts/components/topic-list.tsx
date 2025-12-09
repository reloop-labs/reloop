"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import Link from "next/link";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import useSWR from "swr";
import { TopicTable } from "./topic-table";
import { DeleteTopicModal } from "./delete-topic";
import { EmptyState } from "./empty-state";

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

export const TopicList = () => {
  const { activeOrganization } = useUserOrganization();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

  const { data, error, isLoading } = useSWR<TopicListResponse>(
    activeOrganization?.id
      ? `/api/audience/v1/topics/list?limit=${pageSize}&page=${currentPage}`
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
        (topic.description &&
          topic.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    }) || [];

  return (
    <div className="mx-auto max-w-3xl sm:px-8">
      <div className="flex items-center justify-between pt-10">
        <p className="font-medium text-2xl">
          Topic{data?.topics.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Link
            className={Button.buttonVariants({
              variant: "neutral",
              size: "xsmall",
            }).root()}
            href={`/${activeOrganization.slug}/topics/add`}
          >
            <Icon name="plus" className="h-4 w-4" />
            Create topic
          </Link>
        </div>
      </div>
      <div>
        {error ? (
          <div className="flex flex-col items-center justify-center gap-2 p-4">
            <Icon name="alert-circle" className="h-8 w-8 text-red-500" />
            <p className="text-center text-sm text-text-sub-600">
              Failed to load topics
            </p>
          </div>
        ) : data?.topics && data.topics.length === 0 ? (
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
              <div className="mt-4 pb-8 flex items-center justify-between text-paragraph-sm text-text-sub-600">
                <div className="flex items-center gap-3">
                  <span>
                    Showing {startIndex}–{endIndex} of {data.total} topic{data.total !== 1 ? "s" : ""}
                  </span>
                  <Select.Root
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                    size="xsmall"
                  >
                    <Select.Trigger className="w-16 text-xs">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content className="text-xs min-w-16">
                      <Select.Item value="10" className="text-xs">10</Select.Item>
                      <Select.Item value="20" className="text-xs">20</Select.Item>
                      <Select.Item value="50" className="text-xs">50</Select.Item>
                      <Select.Item value="100" className="text-xs">100</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
                <div className="flex items-center gap-2">
                  <Button.Root
                    variant="neutral"
                    mode="stroke"
                    size="xxsmall"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
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
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || isLoading}
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
    </div>
  );
};
