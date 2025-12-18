"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
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

interface EditPropertyModalProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditSuccess?: () => void;
}

export const EditPropertyModal = ({
  property,
  open,
  onOpenChange,
  onEditSuccess
}: EditPropertyModalProps) => {
  const [fallbackValue, setFallbackValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSWRConfig();

  // Initialize fallback value when modal opens or property changes
  useEffect(() => {
    if (open && property) {
      setFallbackValue(property.fallbackValue || "");
    }
  }, [open, property]);

  // Cmd/Ctrl + Enter to submit
  useHotkeys("mod+enter", (e) => {
    e.preventDefault();
    if (open && !isSubmitting && property) {
      handleSubmit();
    }
  }, { enableOnFormTags: ["INPUT"] });

  const handleSubmit = async () => {
    if (!property) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/contacts/v1/properties/${property.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fallbackValue: fallbackValue || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update property");
      }

      toast.success("Property updated successfully");
      onOpenChange(false);
      await mutate((key: string) => typeof key === "string" && key.includes("/api/contacts/v1/properties"));

      onEditSuccess?.();
    } catch (error) {
      console.error("Failed to update property:", error);
      toast.error("Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!property) return null;

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
        <div className="border border-stroke-soft-100/50 rounded-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isSubmitting) {
                handleSubmit();
              }
            }}
          >
            <Modal.Header className="before:border-stroke-soft-200/50">
              <div className="flex items-center justify-center">
                <Icon name="edit-2" className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <Modal.Title>Edit Property</Modal.Title>
              </div>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              {/* Property Name (Read-only) */}
              <div className="space-y-2">
                <label className="text-text-strong-950 text-sm font-medium">
                  Property Name
                </label>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input
                      type="text"
                      className="px-2 bg-bg-weak-50 cursor-not-allowed"
                      value={property.name}
                      disabled
                      readOnly
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>

              {/* Property Type (Read-only) */}
              <div className="space-y-2">
                <label className="text-text-strong-950 text-sm font-medium">
                  Property Type
                </label>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input
                      type="text"
                      className="px-2 bg-bg-weak-50 cursor-not-allowed"
                      value={property.type}
                      disabled
                      readOnly
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>

              {/* Fallback Value (Editable) */}
              <div className="space-y-2">
                <label className="text-text-strong-950 text-sm font-medium">
                  Fallback Value
                </label>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input
                      type="text"
                      className="px-2"
                      value={fallbackValue}
                      onChange={(e) => setFallbackValue(e.target.value)}
                      placeholder="Enter fallback value"
                      disabled={isSubmitting}
                    />
                  </Input.Wrapper>
                </Input.Root>
                <p className="text-text-sub-600 text-xs">
                  This value will be used when a contact doesn't have this property set.
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
              <Button.Root
                type="submit"
                variant="neutral"
                size="xsmall"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size={14} color="currentColor" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save
                    <span className="inline-flex items-center gap-0.5">
                      <Icon name="command" className="w-4 h-4 border rounded-sm p-px border-stroke-soft-100/20" />
                      <Icon name="enter" className="w-4 h-4 border rounded-sm p-px border-stroke-soft-100/20" />
                    </span>
                  </>
                )}
              </Button.Root>
            </Modal.Footer>
          </form>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
