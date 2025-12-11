"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useRef, useState } from "react";
import { toast } from "sonner";

export interface InviteDropdownProps {
  inviteId: string;
  onCancelInvite: (id: string) => void;
  isCancelling: boolean;
}

const inviteMenuItems = [
  { id: "resend", label: "Resend invite", icon: "mail" as const, isDanger: false },
  { id: "copy", label: "Copy invite link", icon: "link" as const, isDanger: false },
  { id: "revoke", label: "Revoke invite", icon: "cross" as const, isDanger: true },
];

export const InviteDropdown = ({ inviteId, onCancelInvite, isCancelling }: InviteDropdownProps) => {
  const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  const currentTab = buttonRefs.current[hoverIdx ?? -1];
  const currentRect = currentTab?.getBoundingClientRect();
  const hoveredItem = inviteMenuItems[hoverIdx ?? -1];
  const isDanger = hoveredItem?.isDanger ?? false;

  const handleItemClick = (itemId: string) => {
    if (itemId === "revoke") {
      onCancelInvite(inviteId);
    } else if (itemId === "copy") {
      // TODO: Implement copy invite link
      toast.success("Invite link copied to clipboard");
    } else if (itemId === "resend") {
      // TODO: Implement resend invite
      toast.success("Invite resent");
    }
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          type="button"
          className="flex h-4 w-4 items-center justify-center rounded-lg text-text-sub-600 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950"
        >
          <Icon name="more-vertical" className="h-3 w-3" />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Content align="end" className="w-40 p-1.5">
        <div className="relative">
          {inviteMenuItems.map((item, idx) => (
            <button
              key={item.id}
              ref={(el) => {
                if (el) buttonRefs.current[idx] = el;
              }}
              type="button"
              onPointerEnter={() => setHoverIdx(idx)}
              onPointerLeave={() => setHoverIdx(undefined)}
              onClick={() => handleItemClick(item.id)}
              disabled={item.id === "revoke" && isCancelling}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-normal transition-colors",
                item.isDanger ? "text-error-base" : "text-text-strong-950",
                !currentRect && hoverIdx === idx && (item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
                isCancelling && item.id === "revoke" && "opacity-50 cursor-not-allowed"
              )}
            >
              {item.id === "revoke" && isCancelling ? (
                <Spinner size={14} color="var(--error-base)" />
              ) : (
                <Icon
                  name={item.icon}
                  className={cn("h-3.5 w-3.5", item.isDanger ? "" : "text-text-sub-600")}
                />
              )}
              <span>{item.label}</span>
            </button>
          ))}
          <AnimatedHoverBackground
            rect={currentRect}
            tabElement={currentTab}
            isDanger={isDanger}
          />
        </div>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
