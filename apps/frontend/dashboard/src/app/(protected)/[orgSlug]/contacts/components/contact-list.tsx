"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Skeleton } from "@reloop/ui/skeleton";
import { useState } from "react";
import useSWR from "swr";

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

  const { data, error, isLoading } = useSWR<ContactListResponse>(
    activeOrganization?.id
      ? `/api/audience/v1/contacts/list?organizationId=${activeOrganization.id}&limit=100`
      : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

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
          Add contacts by subscribing them to a topic.
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
    </div>
  );
};
