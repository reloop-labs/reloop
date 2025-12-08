"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import { Skeleton } from "@reloop/ui/skeleton";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import useSWR from "swr";
import { toast } from "sonner";

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

interface ContactListResponse {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
}

export const ContactList = () => {
  const { activeOrganization } = useUserOrganization();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

  const { data, error, isLoading } = useSWR<ContactListResponse>(
    activeOrganization?.id
      ? `/api/audience/v1/contacts/list?limit=${pageSize}&page=${currentPage}`
      : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

  // Filter contacts based on search query
  const filteredContacts =
    data?.contacts?.filter((contact) => {
      const matchesSearch =
        searchQuery === "" ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.firstName &&
          contact.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.lastName &&
          contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    }) || [];

  const handleDownloadCSV = async () => {
    try {
      // Fetch all contacts for export
      const response = await fetch(
        `/api/audience/v1/contacts/list?limit=10000`
      );
      const allData = await response.json() as ContactListResponse;

      if (!allData.contacts || allData.contacts.length === 0) {
        toast.error("No contacts to export");
        return;
      }

      // Create CSV content
      const headers = ["Email", "First Name", "Last Name", "Created At"];
      const csvRows = allData.contacts.map((contact) => [
        contact.email,
        contact.firstName || "",
        contact.lastName || "",
        new Date(contact.createdAt).toISOString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success("Contacts exported successfully");
    } catch (error) {
      console.error("Failed to download CSV:", error);
      toast.error("Failed to export contacts");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-4">
        <Icon name="alert-circle" className="h-8 w-8 text-red-500" />
        <p className="text-center text-sm text-text-sub-600">
          Failed to load contacts
        </p>
      </div>
    );
  }

  if (!isLoading && data?.contacts && data.contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-weak-50">
          <Icon name="users" className="h-8 w-8 text-text-sub-600" />
        </div>
        <h3 className="mb-2 font-medium text-lg text-text-strong-950">No contacts yet</h3>
        <p className="max-w-sm text-center text-paragraph-sm text-text-sub-600">
          Add contacts using the "Add Contact" button above.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
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
        <Button.Root
          variant="neutral"
          mode="stroke"
          size="xsmall"
          onClick={handleDownloadCSV}
          disabled={!data?.contacts || data.contacts.length === 0}
          title="Export CSV"
        >
          <Icon name="file-download" className="h-4 w-4" />
        </Button.Root>
      </div>

      <div className="mt-4 w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
        <div className="grid grid-cols-[1fr_minmax(180px,auto)_minmax(120px,auto)]">
          {/* Header */}
          <div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
            <div className="py-2.5">Email</div>
          </div>
          <div className="bg-bg-weak-50 font-medium text-text-sub-600">
            <div className="py-2.5">Name</div>
          </div>
          <div className="bg-bg-weak-50 font-medium text-text-sub-600">
            <div className="py-2.5">Created</div>
          </div>

          {/* Loading State */}
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="group/row contents">
                <div className="flex items-center border-stroke-soft-200 border-t py-2.5 pl-5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                  </div>
                </div>
                <div className="flex items-center border-stroke-soft-200 border-t py-2.5">
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
                <div className="flex items-center border-stroke-soft-200 border-t py-2.5">
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>
            ))
            : filteredContacts.map((contact) => (
              <div key={contact.id} className="group/row contents">
                <div className="flex items-center border-stroke-soft-200 border-t py-2.5 pl-5 group-hover/row:bg-bg-weak-50">
                  <div className="flex items-center gap-2">
                    <Icon name="user" className="h-4 w-4 text-text-sub-600" />
                    <span className="font-medium text-label-sm text-text-strong-950">
                      {contact.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
                  <span className="text-label-sm text-text-sub-600">
                    {contact.firstName || contact.lastName
                      ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
                  <span className="text-label-sm text-text-sub-600">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Pagination */}
      {data && data.total > 0 && (
        <div className="mt-4 flex items-center justify-between text-paragraph-sm text-text-sub-600">
          <div className="flex items-center gap-3">
            <span>
              Showing {startIndex}–{endIndex} of {data.total} contact{data.total !== 1 ? "s" : ""}
            </span>
            <Select.Root
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
              size="xsmall"
            >
              <Select.Trigger className="w-16 text-xs">
                <Select.Value />
              </Select.Trigger>
              <Select.Content className="text-xs min-w-16">
                <Select.Item value="10" className="text-xs">10</Select.Item>
                <Select.Item value="20" className="text-xs">20</Select.Item>
                <Select.Item value="50" className="text-xs">50</Select.Item>
                <Select.Item value="100" className="text-xs">100</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
          <div className="flex items-center gap-2">
            <Button.Root
              variant="neutral"
              mode="stroke"
              size="xxsmall"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
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
              disabled={currentPage === totalPages || isLoading}
            >
              <Icon name="chevron-right" className="h-4 w-4" />
            </Button.Root>
          </div>
        </div>
      )}
    </div>
  );
};
