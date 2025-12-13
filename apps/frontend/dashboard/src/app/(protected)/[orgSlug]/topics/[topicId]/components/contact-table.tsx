"use client";
import { getAnimationProps } from "@fe/dashboard/utils/domain";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import {
  Content as PopoverContent,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { AnimatePresence, motion } from "motion/react";
import { useState, useRef } from "react";

interface Subscription {
  id: string;
  contactId: string;
  topicId: string;
  organizationId: string;
  status: "subscribed" | "unsubscribed";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  contact?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface ContactTableProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
  loadingRows?: number;
  onUnsubscribe: (contactId: string) => void;
  onSubscribe: (contactId: string) => void;
  onRemove: (contactId: string) => void;
}

export const ContactTable = ({
  subscriptions,
  isLoading,
  loadingRows = 4,
  onUnsubscribe,
  onSubscribe,
  onRemove,
}: ContactTableProps) => {
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  const currentTab = buttonRefs.current[hoverIdx ?? -1];
  const currentRect = currentTab?.getBoundingClientRect();

  return (
    <AnimatePresence mode="wait">
      <div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
        <div className="grid grid-cols-[1fr_minmax(120px,auto)_minmax(100px,auto)_minmax(40px,auto)]">
          {/* Headers */}
          <div className="pl-5 text-text-sub-600">
            <div className="flex items-center gap-2 py-3">
              <Icon name="user" className="h-4 w-4" />
              <span className="text-[13px]">Contact</span>
            </div>
          </div>
          <div className="text-text-sub-600">
            <div className="flex items-center gap-2 py-3">
              <Icon name="bell" className="h-4 w-4" />
              <span className="text-[13px]">Status</span>
            </div>
          </div>
          <div className="text-text-sub-600">
            <div className="flex items-center gap-2 py-3">
              <Icon name="clock" className="h-4 w-4" />
              <span className="text-[13px]">Added</span>
            </div>
          </div>
          <div>
            <div className="py-3" />
          </div>

          {/* Loading State */}
          {isLoading
            ? Array.from({ length: loadingRows }).map((_, index) => (
              <div key={`skeleton-${index}`} className="group/row contents">
                <div className="flex items-center border-stroke-soft-200/70 border-t py-2">
                  <div className="my-1 pl-5 flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="flex items-center border-stroke-soft-200/70 border-t py-2">
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center border-stroke-soft-200/70 border-t py-2">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center border-stroke-soft-200/70 border-t py-2">
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            ))
            : subscriptions.map((subscription, index) => {
              const isRowActive = activePopoverId === subscription.id;
              return (
                <div key={subscription.id} className="group/row contents">
                  {/* Contact Column */}
                  <div className={cn(
                    "flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
                    isRowActive && "bg-bg-weak-50/50"
                  )}>
                    <motion.div
                      {...getAnimationProps(index + 1, 0)}
                      className="flex items-center gap-2 pl-5"
                    >
                      <Icon name="user" className="h-4 w-4 text-text-sub-600" />
                      <span className="font-medium text-label-sm text-text-strong-950">
                        {subscription.contact?.email || subscription.contactId}
                      </span>
                    </motion.div>
                  </div>

                  {/* Status Column */}
                  <div className={cn(
                    "flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
                    isRowActive && "bg-bg-weak-50/50"
                  )}>
                    <motion.div
                      {...getAnimationProps(index + 1, 1)}
                      className={cn(
                        "flex items-center gap-1 font-medium text-label-xs capitalize",
                        subscription.status === "subscribed"
                          ? "text-success-base"
                          : "text-text-sub-600"
                      )}
                    >
                      <Icon
                        name={subscription.status === "subscribed" ? "check-circle" : "minus-circle"}
                        className="h-3.5 w-3.5"
                      />
                      {subscription.status}
                    </motion.div>
                  </div>

                  {/* Added Column */}
                  <div className={cn(
                    "flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
                    isRowActive && "bg-bg-weak-50/50"
                  )}>
                    <motion.span
                      {...getAnimationProps(index + 1, 2)}
                      className="text-label-sm text-text-strong-950"
                    >
                      {formatRelativeTime(subscription.createdAt)}
                    </motion.span>
                  </div>

                  {/* Actions Column */}
                  <div className={cn(
                    "flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
                    isRowActive && "bg-bg-weak-50/50"
                  )}>
                    <motion.div
                      {...getAnimationProps(index + 1, 3)}
                      className="flex items-center justify-center"
                    >
                      <PopoverRoot
                        open={activePopoverId === subscription.id}
                        onOpenChange={(open) => setActivePopoverId(open ? subscription.id : null)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-bg-weak-50"
                          >
                            <Icon name="more-vertical" className="h-3 w-3 text-text-sub-600" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-40 p-1.5 rounded-xl" sideOffset={-6}>
                          <div className="relative">
                            {subscription.status === "subscribed" ? (
                              <button
                                ref={(el) => { if (el) buttonRefs.current[0] = el; }}
                                type="button"
                                onPointerEnter={() => setHoverIdx(0)}
                                onPointerLeave={() => setHoverIdx(undefined)}
                                onClick={() => {
                                  onUnsubscribe(subscription.contactId);
                                  setActivePopoverId(null);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-normal text-text-strong-950 transition-colors"
                              >
                                <Icon name="bell-minus" className="h-3.5 w-3.5" />
                                Unsubscribe
                              </button>
                            ) : (
                              <button
                                ref={(el) => { if (el) buttonRefs.current[0] = el; }}
                                type="button"
                                onPointerEnter={() => setHoverIdx(0)}
                                onPointerLeave={() => setHoverIdx(undefined)}
                                onClick={() => {
                                  onSubscribe(subscription.contactId);
                                  setActivePopoverId(null);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-normal text-text-strong-950 transition-colors"
                              >
                                <Icon name="bell-plus" className="h-3.5 w-3.5" />
                                Subscribe
                              </button>
                            )}
                            <button
                              ref={(el) => { if (el) buttonRefs.current[1] = el; }}
                              type="button"
                              onPointerEnter={() => setHoverIdx(1)}
                              onPointerLeave={() => setHoverIdx(undefined)}
                              onClick={() => {
                                onRemove(subscription.contactId);
                                setActivePopoverId(null);
                              }}
                              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-normal text-error-base transition-colors"
                            >
                              <Icon name="trash" className="h-3.5 w-3.5" />
                              Remove
                            </button>
                            <AnimatedHoverBackground
                              rect={currentRect}
                              tabElement={currentTab}
                            />
                          </div>
                        </PopoverContent>
                      </PopoverRoot>
                    </motion.div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </AnimatePresence>
  );
};

