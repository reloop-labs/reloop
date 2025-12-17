"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import Spinner from "@reloop/ui/spinner";

interface Topic {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface DeleteTopicModalProps {
  topics: Topic[];
}

export const DeleteTopicModal = ({ topics }: DeleteTopicModalProps) => {
  const [deleteId, setDeleteId] = useQueryState("delete");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { mutate } = useSWRConfig();
  const { activeOrganization } = useUserOrganization();
  const router = useRouter();

  const topicToDelete = topics.find((topic) => topic.id === deleteId);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleClose = () => {
    setDeleteId(null);
    setConfirmationText("");
  };

  const handleDelete = async () => {
    if (!topicToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/contacts/v1/topics/delete/${topicToDelete.id}`, {
        withCredentials: true,
      });
      await mutate(`/api/contacts/v1/topics/list?limit=100`);

      toast.success(`${topicToDelete.name} deleted successfully`);
      handleClose();
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete topic"
        : "Failed to delete topic";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal.Root
      open={!!deleteId}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
        <div className="border border-stroke-soft-100/50 rounded-2xl">
          <Modal.Header className="before:border-stroke-soft-200/50">
            <div className="flex-1">
              <Modal.Title className="text-sm">Delete Topic</Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body className="space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-text-sub-600 text-paragraph-sm">
                Are you sure you want to delete this topic?
              </p>
              <p className="font-medium text-error-base text-paragraph-sm">
                This will permanently delete the topic and unsubscribe all contacts from it.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-text-strong-950 text-paragraph-sm">
                Type{" "}
                <span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-2 py-0.5 font-mono text-text-strong-950 text-paragraph-xs border border-stroke-soft-200">
                  {topicToDelete?.name}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          topicToDelete?.name || ""
                        );
                        setIsCopied(true);
                      } catch {
                        toast.error("Failed to copy topic name");
                      }
                    }}
                    className="text-text-sub-600 hover:text-text-strong-950 transition-colors"
                  >
                    <Icon
                      name={isCopied ? "check" : "copy"}
                      className={`h-3 w-3 ${isCopied ? "text-success-base" : ""}`}
                    />
                  </button>
                </span>{" "}
                to confirm.
              </p>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Enter topic name"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
            <Button.Root
              variant="neutral"
              mode="stroke"
              size="small"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
              <Kbd.Root className="bg-bg-weak-50 text-[10px]">Esc</Kbd.Root>
            </Button.Root>
            <Button.Root
              variant="error"
              size="small"
              onClick={handleDelete}
              disabled={isDeleting || confirmationText !== topicToDelete?.name}
            >
              {isDeleting ? (
                <>
                  <Spinner size={16} />
                  Deleting...
                </>
              ) : (
                "Delete Topic"
              )}
            </Button.Root>
          </Modal.Footer>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};

