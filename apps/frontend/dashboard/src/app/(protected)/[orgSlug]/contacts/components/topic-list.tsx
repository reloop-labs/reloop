"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useState } from "react";
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

  const { data, error, isLoading } = useSWR<TopicListResponse>(
    activeOrganization?.id
      ? `/api/audience/v1/topics/list?organizationId=${activeOrganization.id}&limit=100`
      : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

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
          </div>
        )}
      </div>
      <DeleteTopicModal topics={data?.topics || []} />
    </div>
  );
};
