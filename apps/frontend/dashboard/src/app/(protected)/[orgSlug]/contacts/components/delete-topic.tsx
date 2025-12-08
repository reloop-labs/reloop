"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useSWRConfig } from "swr";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { activeOrganization } = useUserOrganization();
  const { changeStatus, status } = useLoading();

  const topicIdToDelete = searchParams.get("delete");
  const isOpen = Boolean(topicIdToDelete);

  const topicToDelete = useMemo(() => {
    return topics.find((topic) => topic.id === topicIdToDelete);
  }, [topics, topicIdToDelete]);

  const handleClose = () => {
    router.push(`/${activeOrganization.slug}/contacts`);
  };

  const handleDelete = async () => {
    if (!topicIdToDelete) return;

    try {
      changeStatus("loading");
      await axios.delete(`/api/audience/v1/topics/delete/${topicIdToDelete}`, {
        withCredentials: true,
      });
      await mutate(
        `/api/audience/v1/topics/list?organizationId=${activeOrganization.id}&limit=100`,
      );
      handleClose();
    } catch (error) {
      console.error("Failed to delete topic:", error);
    } finally {
      changeStatus("idle");
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Modal.Content className="max-w-md">
        <Modal.Header>
          <Modal.Title>Delete Topic</Modal.Title>
          <Modal.Description>
            Are you sure you want to delete this topic?
          </Modal.Description>
        </Modal.Header>

        <div className="p-4">
          {topicToDelete && (
            <div className="rounded-lg border border-stroke-soft-200 p-4">
              <div className="flex items-center gap-3">
                <Icon name="tag" className="h-5 w-5 text-text-sub-600" />
                <div>
                  <p className="font-medium">{topicToDelete.name}</p>
                  <p className="text-sm text-text-sub-600">
                    {topicToDelete.description || "No description"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <Icon name="alert-circle" className="mt-0.5 h-4 w-4 text-red-600" />
              <div>
                <p className="font-medium text-sm text-red-800">Warning</p>
                <p className="text-sm text-red-700">
                  This will permanently delete the topic and unsubscribe all
                  contacts from it. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Modal.Footer>
          <Button.Root variant="neutral" mode="stroke" onClick={handleClose}>
            Cancel
          </Button.Root>
          <Button.Root
            variant="error"
            onClick={handleDelete}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Spinner color="white" />
                Deleting...
              </>
            ) : (
              <>
                <Icon name="trash" className="h-4 w-4" />
                Delete Topic
              </>
            )}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
