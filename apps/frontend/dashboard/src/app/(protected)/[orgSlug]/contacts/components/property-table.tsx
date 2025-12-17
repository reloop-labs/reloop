"use client";

import { Icon } from "@reloop/ui/icon";
import * as Dropdown from "@reloop/ui/dropdown";
import { AnimatePresence, motion } from "motion/react";
import { Skeleton } from "@reloop/ui/skeleton";
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
  isLoading: boolean;
  loadingRows?: number;
  onDelete?: (propertyId: string) => void;
}

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_1fr_120px_40px] gap-4 px-4 py-2 text-xs text-text-soft-400 uppercase tracking-wider border-b border-stroke-soft-200">
        <div className="flex items-center gap-1.5">
          <Icon name="text" className="h-3.5 w-3.5" />
          Name
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="database" className="h-3.5 w-3.5" />
          Type
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="brackets" className="h-3.5 w-3.5" />
          Fallback
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="clock" className="h-3.5 w-3.5" />
          Created
        </div>
        <div />
      </div>

      {/* Rows */}
      <div className="divide-y divide-stroke-soft-200">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: loadingRows }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-[1fr_100px_1fr_120px_40px] gap-4 px-4 py-3"
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-6" />
              </motion.div>
            ))
          ) : properties.length === 0 ? (
            <div className="px-4 py-8 text-center text-text-soft-400 text-sm">
              No properties found
            </div>
          ) : (
            properties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[1fr_100px_1fr_120px_40px] gap-4 px-4 py-3 items-center hover:bg-bg-weak-50 transition-colors"
              >
                {/* Name */}
                <div className="text-sm text-text-strong-950 font-medium truncate">
                  {property.name}
                </div>

                {/* Type Badge */}
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${property.type === "string"
                        ? "bg-blue-alpha-10 text-blue-600"
                        : "bg-purple-alpha-10 text-purple-600"
                      }`}
                  >
                    {property.type}
                  </span>
                </div>

                {/* Fallback Value */}
                <div className="text-sm text-text-sub-600 truncate">
                  {property.fallbackValue || "—"}
                </div>

                {/* Created */}
                <div className="text-sm text-text-sub-600">
                  {formatDate(property.createdAt)}
                </div>

                {/* Actions */}
                <div>
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
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
