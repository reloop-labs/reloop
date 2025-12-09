"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
  Content as PopoverContent,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

// Animation utility function (matching domain table)
const getAnimationProps = (row: number, column: number) => ({
  initial: { opacity: 0, y: "-100%" },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "100%" },
  transition: {
    duration: 0.5,
    delay: row * 0.07 + column * 0.1,
    ease: [0.65, 0, 0.35, 1] as const,
  },
});

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
  const router = useRouter();
  const selectedTopicId = searchParams.get("delete");

  const handleViewDetails = (topicId: string) => {
    router.push(`/${activeOrganizationSlug}/topics/${topicId}`);
  };

  const handleDelete = (topicId: string) => {
    router.push(`?delete=${topicId}`);
  };

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
        {topics.map((topic, index) => (
          <div key={topic.id} className="group/row contents">
            <Link
              href={`/${activeOrganizationSlug}/topics/${topic.id}`}
              className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50"
            >
              <motion.div {...getAnimationProps(index, 0)} className="flex items-center gap-2 pl-5">
                <Icon name="notification-indicator" className="h-4 w-4 text-text-sub-600" />
                <span className="font-medium text-label-sm text-text-strong-950">
                  {topic.name}
                </span>
              </motion.div>
            </Link>
            <Link
              href={`/${activeOrganizationSlug}/topics/${topic.id}`}
              className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50"
            >
              <motion.span {...getAnimationProps(index, 1)} className="text-label-sm text-text-sub-600">
                {new Date(topic.createdAt).toLocaleDateString()}
              </motion.span>
            </Link>
            <div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
              <div className="opacity-0 group-hover/row:opacity-100 transition-opacity">
                <PopoverRoot>
                  <PopoverTrigger asChild>
                    <Button.Root
                      variant="neutral"
                      mode="ghost"
                      size="xxsmall"
                      className="rounded p-1"
                    >
                      <Icon
                        name="more-vertical"
                        className="h-4 w-4 text-text-sub-600 hover:text-text-strong-950"
                      />
                    </Button.Root>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48 p-2">
                    <div className="flex flex-col gap-1">
                      <Button.Root
                        variant="neutral"
                        mode="ghost"
                        size="small"
                        onClick={() => handleViewDetails(topic.id)}
                        className="w-full justify-start"
                      >
                        <Icon name="eye-outline" className="h-4 w-4" />
                        View Details
                      </Button.Root>
                      <Button.Root
                        variant="error"
                        mode="ghost"
                        size="small"
                        onClick={() => handleDelete(topic.id)}
                        className="w-full justify-start"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                        Delete Topic
                      </Button.Root>
                    </div>
                  </PopoverContent>
                </PopoverRoot>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
