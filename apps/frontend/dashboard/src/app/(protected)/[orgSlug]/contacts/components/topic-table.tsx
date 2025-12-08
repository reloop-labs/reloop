"use client";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Topic {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface TopicTableProps {
  topics: Topic[];
  activeOrganizationSlug: string;
  isLoading: boolean;
  loadingRows: number;
}

export const TopicTable = ({
  topics,
  activeOrganizationSlug,
  isLoading,
  loadingRows,
}: TopicTableProps) => {
  const searchParams = useSearchParams();
  const selectedTopicId = searchParams.get("delete");

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
        <div className="grid grid-cols-[1fr_minmax(200px,auto)_48px]">
          <div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
            <div className="py-2.5">Topic</div>
          </div>
          <div className="bg-bg-weak-50 font-medium text-text-sub-600">
            <div className="py-2.5">Created</div>
          </div>
          <div className="bg-bg-weak-50 font-medium text-text-sub-600">
            <div className="py-2.5" />
          </div>
          {Array.from({ length: loadingRows }).map((_, index) => (
            <div key={`skeleton-${index}`} className="group/row contents">
              <div className="flex items-center border-stroke-soft-200 border-t py-2.5">
                <div className="flex items-center gap-2 pl-5">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                </div>
              </div>
              <div className="flex items-center border-stroke-soft-200 border-t py-2.5">
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex items-center border-stroke-soft-200 border-t py-2.5">
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
      <div className="grid grid-cols-[1fr_minmax(200px,auto)_48px]">
        <div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
          <div className="py-2.5">Topic</div>
        </div>
        <div className="bg-bg-weak-50 font-medium text-text-sub-600">
          <div className="py-2.5">Created</div>
        </div>
        <div className="bg-bg-weak-50 font-medium text-text-sub-600">
          <div className="py-2.5" />
        </div>
        {topics.map((topic) => (
          <div key={topic.id} className="group/row contents">
            <Link
              href={`/${activeOrganizationSlug}/contacts/${topic.id}`}
              className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50"
            >
              <div className="flex items-center gap-2 pl-5">
                <Icon name="tag" className="h-4 w-4 text-text-sub-600" />
                <div className="flex flex-col">
                  <span className="font-medium text-label-sm text-text-strong-950">
                    {topic.name}
                  </span>
                  <span className="text-label-xs text-text-sub-600">
                    {topic.description || "No description"}
                  </span>
                </div>
              </div>
            </Link>
            <Link
              href={`/${activeOrganizationSlug}/contacts/${topic.id}`}
              className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50"
            >
              <span className="text-label-sm text-text-sub-600">
                {new Date(topic.createdAt).toLocaleDateString()}
              </span>
            </Link>
            <div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
              <Link
                href={`?delete=${topic.id}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-error-base"
              >
                <Icon name="trash" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
