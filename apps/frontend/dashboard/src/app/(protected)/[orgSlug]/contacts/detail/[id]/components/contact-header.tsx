"use client";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
  Content as PopoverContent,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { EditContactModal } from "../../../components/edit-contact-modal";

interface ContactData {
  id: string;
  email: string;
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface PropertyValueWithName {
  id: string;
  propertyId: string;
  value: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactHeaderProps {
  contact: ContactData | undefined;
  isLoading: boolean;
  propertyValues: PropertyValueWithName[];
}

const getStatusColor = (status: string) => {
  return status.toLowerCase() === "subscribed" ? "text-success-base" : "text-text-sub-600";
};

const getStatusIcon = (status: string) => {
  return status.toLowerCase() === "subscribed" ? "check-circle" : "cross-circle";
};

const getStatusBadgeStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "subscribed":
      return "border border-success-base text-success-base bg-success-light/20";
    case "unsubscribed":
      return "border border-neutral-base text-neutral-base bg-neutral-light/20";
    default:
      return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
  }
};

const formatStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case "subscribed":
      return "Subscribed";
    case "unsubscribed":
      return "Unsubscribed";
    default:
      return status;
  }
};

// Convert camelCase to Title Case (e.g., "firstName" -> "FIRST NAME")
const formatPropertyName = (name: string) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .toUpperCase()
    .trim();
};

const headerMenuItems = [
  { id: "edit", label: "Edit contact", icon: "edit" as const, isDanger: false },
  { id: "delete", label: "Delete contact", icon: "trash" as const, isDanger: true },
];

export const ContactHeader = ({
  contact,
  isLoading,
  propertyValues,
}: ContactHeaderProps) => {
  const { push, activeOrganization } = useUserOrganization();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  const currentTab = buttonRefs.current[hoverIdx ?? -1];
  const currentRect = currentTab?.getBoundingClientRect();
  const hoveredItem = headerMenuItems[hoverIdx ?? -1];
  const isDanger = hoveredItem?.isDanger ?? false;

  const handleCopyId = async () => {
    if (contact?.id) {
      try {
        await navigator.clipboard.writeText(contact.id);
        toast.success("Contact ID copied to clipboard");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy ID");
      }
    }
  };

  const handleDelete = async () => {
    if (!contact) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/contacts/v1/contacts/${contact.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      toast.success("Contact deleted");
      await mutate((key: string) => typeof key === "string" && key.includes("/api/contacts/v1/contacts"));

      // Navigate back to contacts list
      if (activeOrganization?.slug) {
        router.push(`/${activeOrganization.slug}/contacts`);
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error("Failed to delete contact");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMenuItemClick = (itemId: string) => {
    if (itemId === "edit") {
      setIsEditModalOpen(true);
    } else if (itemId === "delete") {
      handleDelete();
    }
  };

  if (!contact && !isLoading) {
    return (
      <div className="pt-10 pb-8">
        <AnimatedBackButton onClick={() => push("/contacts")} />
        <div className="flex items-center justify-between pt-6">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-paragraph-xs text-text-sub-600">
                Contact{" "}
              </p>
              <p className="font-semibold text-paragraph-xs text-text-sub-600">
                •
              </p>
              <p className="font-medium text-paragraph-xs text-text-sub-600">
                ---
              </p>
              <p className="font-semibold text-paragraph-xs text-text-sub-600">
                •
              </p>
              <div className="flex items-center gap-1 text-error-base">
                <Icon name="alert-circle" className="h-3.5 w-3.5" />
                <p className="font-medium text-paragraph-xs">Not found</p>
              </div>
            </div>
            <h1 className="font-medium text-title-h6 leading-8">
              Contact not found
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pt-10 pb-8">
        <AnimatedBackButton onClick={() => push("/contacts")} />
        <div className="flex items-center justify-between pt-6">
          <div>
            {isLoading ? (
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-1 w-1 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-1 w-1 rounded-full" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-paragraph-xs text-text-sub-600">
                  Contact{" "}
                </p>
                <p className="font-semibold text-paragraph-xs text-text-sub-600">
                  •
                </p>
                <p className="font-medium text-paragraph-xs text-text-sub-600">
                  {contact?.createdAt
                    ? formatRelativeTime(contact.createdAt)
                    : "---"}
                </p>
                <p className="font-semibold text-paragraph-xs text-text-sub-600">
                  •
                </p>
                <div
                  className={`flex items-center gap-1 ${getStatusColor(contact?.status || "")}`}
                >
                  <Icon
                    name={getStatusIcon(contact?.status || "")}
                    className="h-3.5 w-3.5"
                  />
                  <p className="font-medium text-paragraph-xs">
                    {formatStatusLabel(contact?.status || "")}
                  </p>
                </div>
              </div>
            )}
            {isLoading ? (
              <Skeleton className="mt-2 h-7 w-48 rounded-lg" />
            ) : (
              <h1 className="font-medium text-title-h6 leading-8">{contact?.email}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-9 rounded-lg" />
              </>
            ) : contact ? (
              <>
                <PopoverRoot>
                  <PopoverTrigger asChild>
                    <Button.Root variant="neutral" mode="stroke" size="xsmall">
                      <Icon name="more-vertical" className="h-3.5 w-3.5 text-text-sub-600" />
                    </Button.Root>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={8} className="w-44 p-1.5 rounded-xl" showArrow>
                    <div className="relative">
                      {headerMenuItems.map((item, idx) => (
                        <button
                          key={item.id}
                          ref={(el) => {
                            if (el) buttonRefs.current[idx] = el;
                          }}
                          type="button"
                          onPointerEnter={() => setHoverIdx(idx)}
                          onPointerLeave={() => setHoverIdx(undefined)}
                          onClick={() => handleMenuItemClick(item.id)}
                          disabled={item.id === "delete" && isDeleting}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-2 rounded-lg pl-2 py-1.5 text-xs font-normal transition-colors",
                            item.isDanger ? "text-error-base" : "text-text-strong-950",
                            !currentRect && hoverIdx === idx && (item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10")
                          )}
                        >
                          <Icon
                            name={item.icon}
                            className={cn("h-3.5 w-3.5", item.isDanger ? "" : "text-text-sub-600")}
                          />
                          <span>{item.label}</span>
                        </button>
                      ))}
                      <AnimatedHoverBackground
                        rect={currentRect}
                        tabElement={currentTab}
                        isDanger={isDanger}
                      />
                    </div>
                  </PopoverContent>
                </PopoverRoot>
              </>
            ) : null}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-10 grid grid-cols-[1fr_1fr_1fr_1fr] gap-y-12">
          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Icon name="mail-single" className="h-3.5 w-3.5 text-text-sub-600" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-sub-600">
                Email Address
              </span>
            </div>
            {isLoading ?
              <Skeleton className="h-5 w-32 rounded-lg" />
              : <span className="font-medium text-paragraph-sm text-text-strong-950">
                {contact?.email || "---"}
              </span>}
          </div>

          {/* Created */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Icon name="calendar" className="h-3.5 w-3.5 text-text-sub-600" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-sub-600">
                Created
              </span>
            </div>
            {isLoading ?
              <Skeleton className="h-5 w-24 rounded-lg" />
              : <span className="font-medium text-paragraph-sm text-text-strong-950">
                {contact?.createdAt
                  ? formatRelativeTime(contact.createdAt)
                  : "---"}
              </span>}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Icon name="check-circle" className="h-3.5 w-3.5 text-text-sub-600" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-sub-600">
                Status
              </span>
            </div>
            {isLoading ?
              <Skeleton className="h-5 w-20 rounded-lg" />
              : <span className={cn(
                "inline-flex w-fit rounded-md px-[6px] py-0.5 text-[10px] font-medium border-[1px]",
                getStatusBadgeStyles(contact?.status || "")
              )}>
                {formatStatusLabel(contact?.status || "")}
              </span>}
          </div>

          {/* ID */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Icon name="hash" className="h-3.5 w-3.5 text-text-sub-600" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-sub-600">
                ID
              </span>
            </div>
            {isLoading ?
              <Skeleton className="h-5 w-36 rounded-lg" />
              : <div
                className="flex items-center gap-1.5 group/copy cursor-pointer w-fit"
                onClick={handleCopyId}
              >
                <code className="text-xs font-medium text-text-strong-950 truncate max-w-[140px]">
                  {contact?.id || "---"}
                </code>
                <Icon
                  name={copied ? "check" : "copy"}
                  className={cn(
                    "h-3 w-3 transition-all flex-shrink-0",
                    copied
                      ? "text-success-base"
                      : "text-text-sub-600 opacity-0 group-hover/copy:opacity-100"
                  )}
                />
              </div>}
          </div>
        </div>

        {/* Properties Section */}
        {propertyValues.length > 0 && (
          <div className="mt-12">
            <h2 className="font-medium text-title-h6 mb-6">Properties</h2>
            <div className="grid grid-cols-4 gap-y-8">
              {propertyValues.map((pv) => (
                <div key={pv.id} className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-text-sub-600">
                    {formatPropertyName(pv.name)}
                  </span>
                  <span className="font-medium text-paragraph-sm text-text-strong-950">
                    {pv.value || "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Contact Modal */}
      {contact && (
        <EditContactModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          contact={contact}
        />
      )}
    </>
  );
};
