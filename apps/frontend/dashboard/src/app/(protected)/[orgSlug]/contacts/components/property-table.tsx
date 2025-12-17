"use client";

import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Dropdown from "@reloop/ui/dropdown";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Property {
  id: string;
  name: string;
  type: string;
  fallbackValue: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface PropertyTableProps {
  properties: Property[];
  isLoading?: boolean;
  loadingRows?: number;
  onDelete?: (propertyId: string) => void;
}

const getAnimationProps = (row: number, column: number) => {
  return {
    initial: { opacity: 0, y: "-100%" },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: "100%" },
    transition: {
      duration: 0.5,
      delay: row * 0.07 + column * 0.1,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  };
};

const getTypeBadgeStyles = (type: string) => {
  switch (type.toLowerCase()) {
    case "string":
      return "border border-feature-base text-feature-base bg-feature-light/20";
    case "number":
      return "border border-purple-500 text-purple-600 bg-purple-100/20";
    default:
      return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
  }
};

const PropertySkeleton = () => (
  <div className="grid grid-cols-[1fr_100px_1fr_120px_40px] items-center py-2 px-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="h-5 w-16 rounded-md" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-20" />
    <div className="flex items-center justify-end">
      <Skeleton className="h-4 w-4 rounded" />
    </div>
  </div>
);

export const PropertyTable = ({
  properties,
  isLoading,
  loadingRows = 4,
  onDelete,
}: PropertyTableProps) => {
  const { mutate } = useSWRConfig();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (property: Property) => {
    setDeletingId(property.id);
    try {
      const response = await fetch(`/api/contacts/v1/properties/${property.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete property");
      }

      toast.success("Property deleted");
      await mutate((key: string) => typeof key === "string" && key.includes("/api/contacts/v1/properties/list"));
      onDelete?.(property.id);
    } catch (error) {
      console.error("Failed to delete property:", error);
      toast.error("Failed to delete property");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full text-paragraph-sm rounded-xl border border-stroke-soft-100 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_100px_1fr_120px_40px] items-center py-3.5 px-4 text-text-sub-600 border-b border-stroke-soft-100">
          <div className="flex items-center gap-2">
            <Icon name="text" className="h-4 w-4" />
            <span className="text-xs">Name</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="database" className="h-4 w-4" />
            <span className="text-xs">Type</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="brackets" className="h-4 w-4" />
            <span className="text-xs">Fallback</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="clock" className="h-4 w-4" />
            <span className="text-xs">Created At</span>
          </div>
          <div />
        </div>
        {/* Skeleton rows */}
        <div className="divide-y divide-stroke-soft-100">
          {Array.from({ length: loadingRows }).map((_, index) => (
            <PropertySkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <div className="w-full text-paragraph-sm rounded-xl border border-stroke-soft-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_1fr_120px_40px] items-center py-3.5 px-4 text-text-sub-600 border-b border-stroke-soft-100">
          <div className="flex items-center gap-2">
            <Icon name="text" className="h-4 w-4" />
            <span className="text-xs">Name</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="database" className="h-4 w-4" />
            <span className="text-xs">Type</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="brackets" className="h-4 w-4" />
            <span className="text-xs">Fallback</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="clock" className="h-4 w-4" />
            <span className="text-xs">Created At</span>
          </div>
          <div />
        </div>

        {/* Rows */}
        <div className="divide-y divide-stroke-soft-100">
          {properties.length === 0 ? (
            <div className="px-4 py-8 text-center text-text-soft-400 text-sm">
              No properties found
            </div>
          ) : (
            properties.map((property, index) => (
              <div
                key={property.id}
                className={cn(
                  "group/row grid grid-cols-[1fr_100px_1fr_120px_40px] items-center py-2 px-4 transition-colors",
                  "hover:bg-bg-weak-50/50"
                )}
              >
                {/* Name Column */}
                <motion.div
                  {...getAnimationProps(index + 1, 0)}
                  className="flex items-center gap-3"
                >
                  <Icon name="text" className="h-4 w-4 text-text-sub-600 flex-shrink-0" />
                  <span className="truncate font-medium text-label-sm text-text-strong-950">
                    {property.name}
                  </span>
                </motion.div>

                {/* Type Column */}
                <motion.div {...getAnimationProps(index + 1, 1)} className="flex items-center">
                  <span className={cn(
                    "inline-flex rounded-md px-[6px] py-0.5 text-[10px] font-medium border-[1px]",
                    getTypeBadgeStyles(property.type)
                  )}>
                    {property.type}
                  </span>
                </motion.div>

                {/* Fallback Column */}
                <motion.div {...getAnimationProps(index + 1, 2)} className="flex items-center">
                  <span className="text-label-sm text-text-sub-600 truncate">
                    {property.fallbackValue || "—"}
                  </span>
                </motion.div>

                {/* Created At Column */}
                <motion.div {...getAnimationProps(index + 1, 3)} className="flex items-center">
                  <span className="text-label-sm text-text-strong-950 whitespace-nowrap">
                    {formatRelativeTime(property.createdAt)}
                  </span>
                </motion.div>

                {/* Actions Column */}
                <motion.div
                  {...getAnimationProps(index + 1, 4)}
                  className="flex items-center justify-end"
                >
                  <Dropdown.Root>
                    <Dropdown.Trigger asChild>
                      <button
                        type="button"
                        className="p-1 rounded-md hover:bg-neutral-alpha-10 transition-colors"
                        disabled={deletingId === property.id}
                      >
                        <Icon name="more-horizontal" className="h-4 w-4 text-text-sub-600" />
                      </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content align="end" className="min-w-[140px]">
                      <Dropdown.Item
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(property)}
                      >
                        <Icon name="trash" className="h-4 w-4" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Content>
                  </Dropdown.Root>
                </motion.div>
              </div>
            ))
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
