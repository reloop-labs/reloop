"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { ContactList } from "./components/contact-list";
import { TopicList } from "./components/topic-list";

interface ContactListResponse {
  contacts: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
}

interface TopicListResponse {
  topics: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
}

const ContactsPage = () => {
  const { activeOrganization } = useUserOrganization();
  const [activeTab, setActiveTab] = useState("contacts");

  // Fetch contacts count
  const { data: contactsData } = useSWR<ContactListResponse>(
    activeOrganization?.id
      ? `/api/audience/v1/contacts/list?organizationId=${activeOrganization.id}&limit=1`
      : null,
  );

  // Fetch topics count
  const { data: topicsData } = useSWR<TopicListResponse>(
    activeOrganization?.id
      ? `/api/audience/v1/topics/list?organizationId=${activeOrganization.id}&limit=1`
      : null,
  );

  const contactCount = contactsData?.total || 0;
  const topicCount = topicsData?.total || 0;

  return (
    <div className="mx-auto max-w-3xl sm:px-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-10">
        <div>
          <p className="font-medium text-2xl">
            Contacts
          </p>
          <p className="mt-1 text-paragraph-sm text-text-sub-600">
            {contactCount} contact{contactCount !== 1 ? "s" : ""} • {topicCount} topic{topicCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className={Button.buttonVariants({
              variant: "neutral",
              size: "xsmall",
            }).root()}
            href="https://reloop.sh/docs/contacts"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="book-closed" className="h-4 w-4" />
            Go to Docs
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <TabMenu.Root value={activeTab} onValueChange={setActiveTab}>
          <TabMenu.List className="border-b border-stroke-soft-200">
            <TabMenu.Trigger value="contacts">
              <TabMenu.Icon as={() => <Icon name="users" className="h-4 w-4" />} />
              Contacts
            </TabMenu.Trigger>
            <TabMenu.Trigger value="topics">
              <TabMenu.Icon as={() => <Icon name="notification-indicator" className="h-4 w-4" />} />
              Topics
            </TabMenu.Trigger>
          </TabMenu.List>

          <TabMenu.Content value="contacts" className="pt-6">
            <ContactList />
          </TabMenu.Content>

          <TabMenu.Content value="topics" className="pt-6">
            <TopicList />
          </TabMenu.Content>
        </TabMenu.Root>
      </div>
    </div>
  );
};

export default ContactsPage;
