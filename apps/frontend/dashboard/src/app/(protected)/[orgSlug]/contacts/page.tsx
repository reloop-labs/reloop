"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import useSWR from "swr";
import { ContactList } from "./components/contact-list";

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

const ContactsPage = () => {
  const { activeOrganization } = useUserOrganization();

  // Fetch contacts count
  const { data: contactsData } = useSWR<ContactListResponse>(
    activeOrganization?.id
      ? `/api/audience/v1/contacts/list?organizationId=${activeOrganization.id}&limit=1`
      : null,
  );

  const contactCount = contactsData?.total || 0;

  return (
    <div className="mx-auto max-w-3xl sm:px-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-10">
        <div>
          <p className="font-medium text-2xl">
            Contacts
          </p>
          <p className="mt-1 text-paragraph-sm text-text-sub-600">
            {contactCount} contact{contactCount !== 1 ? "s" : ""}
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

      {/* Contacts List */}
      <div className="mt-10">
        <ContactList />
      </div>
    </div>
  );
};

export default ContactsPage;

