"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

export const EmptyState = () => {
  const { activeOrganization } = useUserOrganization();

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-weak-50">
        <Icon name="tag" className="h-8 w-8 text-text-sub-600" />
      </div>
      <h3 className="mb-2 font-medium text-lg">No topics yet</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-text-sub-600">
        Topics help you organize contacts by interest, preference, or category.
        Create your first topic to get started.
      </p>
      <Link
        className={Button.buttonVariants({
          variant: "neutral",
          size: "small",
        }).root()}
        href={`/${activeOrganization.slug}/contacts/add`}
      >
        <Icon name="plus" className="h-4 w-4" />
        Create your first topic
      </Link>
    </div>
  );
};
