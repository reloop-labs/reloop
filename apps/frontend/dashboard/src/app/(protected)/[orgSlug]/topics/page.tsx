"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { TopicList } from "../contacts/components/topic-list";

const TopicsPage = () => {
  const { activeOrganization } = useUserOrganization();

  return (
    <div className="mx-auto max-w-3xl sm:px-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-10">
        <p className="font-medium text-2xl">Topics</p>
        <div className="flex items-center gap-2">
          <Link
            className={Button.buttonVariants({
              variant: "neutral",
              size: "xsmall",
            }).root()}
            href={`/${activeOrganization.slug}/topics/add`}
          >
            <Icon name="plus" className="h-4 w-4" />
            Add topic
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        <TopicList hideHeader />
      </div>
    </div>
  );
};

export default TopicsPage;
