"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import useSWR, { useSWRConfig } from "swr";
import { AddContact } from "./components/add-contact";
import { TopicHeader } from "./components/topic-header";
import { ContactTable } from "./components/contact-table";
import { EmptyState } from "./components/empty-state";

interface Topic {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

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

interface SubscriptionListResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  limit: number;
}

const TopicDetailPage = () => {
  const { topicId, orgSlug } = useParams();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { activeOrganization } = useUserOrganization();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

  const {
    data: topicData,
    error: topicError,
    isLoading: topicLoading,
  } = useSWR<Topic>(`/api/audience/v1/topics/${topicId}`, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const { data: subscriptionData, isLoading: subscriptionLoading } = useSWR<SubscriptionListResponse>(
    `/api/audience/v1/subscriptions/list?topicId=${topicId}&limit=${pageSize}&page=${currentPage}`,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const totalPages = subscriptionData ? Math.ceil(subscriptionData.total / pageSize) : 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, subscriptionData?.total || 0);

  const handleUnsubscribe = async (contactId: string) => {
    try {
      await fetch("/api/audience/v1/subscriptions/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include"
        },
        body: JSON.stringify({ contactId, topicId }),
      });
      await mutate((key: string) => typeof key === 'string' && key.startsWith(`/api/audience/v1/subscriptions/list?topicId=${topicId}`));
    } catch (error) {
      console.error("Failed to unsubscribe contact:", error);
    }
  };

  const handleSubscribe = async (contactId: string) => {
    try {
      await fetch("/api/audience/v1/subscriptions/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include"
        },
        body: JSON.stringify({ contactId, topicId }),
      });
      await mutate((key: string) => typeof key === 'string' && key.startsWith(`/api/audience/v1/subscriptions/list?topicId=${topicId}`));
    } catch (error) {
      console.error("Failed to subscribe contact:", error);
    }
  };

  const handleRemove = async (contactId: string) => {
    try {
      await fetch("/api/audience/v1/subscriptions/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include"
        },
        body: JSON.stringify({ contactId, topicId }),
      });
      await mutate((key: string) => typeof key === 'string' && key.startsWith(`/api/audience/v1/subscriptions/list?topicId=${topicId}`));
    } catch (error) {
      console.error("Failed to remove contact from topic:", error);
    }
  };

  const handleDownloadCSV = () => {
    if (!subscriptionData?.subscriptions || subscriptionData.subscriptions.length === 0) {
      return;
    }

    // Create CSV content
    const headers = ["Contact ID", "Status", "Created At"];
    const csvRows = subscriptionData.subscriptions.map((sub) => [
      sub.contactId,
      sub.status,
      new Date(sub.createdAt).toISOString(),
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${topicData?.name || "topic"}-subscribers.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (topicLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (topicError) {
    return (
      <div className="mx-auto max-w-3xl sm:px-8">
        <div className="flex flex-col items-center justify-center gap-2 p-4">
          <Icon name="alert-circle" className="h-8 w-8 text-red-500" />
          <p className="text-center text-sm text-text-sub-600">
            Failed to load topic
          </p>
        </div>
      </div>
    );
  }

  const filteredSubscriptions = subscriptionData?.subscriptions?.filter((sub) => {
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesStatus;
  }) || [];

  return (
    <div className="mx-auto max-w-3xl sm:px-8">
      <EmptyState onAddContact={() => setShowAddContact(true)} />

      <TopicHeader
        topic={topicData || null}
        isLoading={topicLoading}
        isFailed={!!topicError}
        onOpenAddContact={() => setShowAddContact(true)}
        onOpenBulkImport={() =>
          router.push(`/${orgSlug}/topics/${topicId}/bulk-import`)
        }
      />

      {subscriptionData?.subscriptions && subscriptionData.subscriptions.length === 0 ? (
        <EmptyState onAddContact={() => setShowAddContact(true)} />
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex w-full items-center gap-3">
              <div className="flex-1">
                <Input.Root size="small" className="rounded-xl">
                  <Input.Wrapper>
                    <Input.Icon
                      as={() => <Icon name="search" className="h-4 w-4" />}
                    />
                    <Input.Input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <div className="w-48">
                <Select.Root
                  size="small"
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  disabled={subscriptionLoading}
                >
                  <Select.Trigger className="rounded-xl">
                    <Select.Value placeholder="Status" />
                  </Select.Trigger>
                  <Select.Content className="w-48">
                    <Select.Item value="all">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="users" className="h-4 w-4" />
                        All Status
                      </div>
                    </Select.Item>
                    <Select.Item value="subscribed">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon
                          name="bell-plus"
                          className="h-4 w-4 text-success-base"
                        />
                        Subscribed
                      </div>
                    </Select.Item>
                    <Select.Item value="unsubscribed">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon
                          name="bell-minus"
                          className="h-4 w-4 text-text-sub-600"
                        />
                        Unsubscribed
                      </div>
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
            </div>
            <Button.Root
              variant="neutral"
              mode="stroke"
              size="xsmall"
              onClick={handleDownloadCSV}
              disabled={!subscriptionData?.subscriptions || subscriptionData.subscriptions.length === 0}
            >
              <Icon name="file-download" className="h-4 w-4" />
            </Button.Root>
          </div>

          <div className="mt-4">
            <ContactTable
              subscriptions={filteredSubscriptions}
              isLoading={subscriptionLoading}
              loadingRows={4}
              onUnsubscribe={handleUnsubscribe}
              onSubscribe={handleSubscribe}
              onRemove={handleRemove}
            />
          </div>

          {/* Pagination */}
          {subscriptionData && subscriptionData.total > 0 && (
            <div className="mt-4 pb-8 flex items-center justify-between text-paragraph-sm text-text-sub-600">
              <div className="flex items-center gap-3">
                <span>
                  Showing {startIndex}–{endIndex} of {subscriptionData.total} contact{subscriptionData.total !== 1 ? "s" : ""}
                </span>
                <PageSizeDropdown
                  value={pageSize}
                  onValueChange={(value) => {
                    setPageSize(value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button.Root
                  variant="neutral"
                  mode="stroke"
                  size="xxsmall"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || subscriptionLoading}
                  className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
                >
                  <Icon name="chevron-left" className="h-4 w-4" />
                </Button.Root>
                <span className="px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button.Root
                  variant="neutral"
                  mode="stroke"
                  size="xxsmall"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || subscriptionLoading}
                  className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
                >
                  <Icon name="chevron-right" className="h-4 w-4" />
                </Button.Root>
              </div>
            </div>
          )}
        </div>
      )}
      <AddContact
        topicId={topicId as string}
        topicName={topicData?.name || "Unknown"}
        open={showAddContact}
        onOpenChange={setShowAddContact}
      />
    </div>
  );
};

export default TopicDetailPage;
