"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import {
  Content as PopoverContent,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { ContactList } from "./components/contact-list";

const ContactsPage = () => {
  const { activeOrganization } = useUserOrganization();
  const { mutate } = useSWRConfig();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/audience/v1/contacts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create contact");
      }

      toast.success("Contact created successfully");
      setIsCreateModalOpen(false);
      setEmail("");
      setFirstName("");
      setLastName("");

      // Refresh the list
      await mutate((key: string) => typeof key === 'string' && key.includes('/api/audience/v1/contacts/list'));
    } catch (error) {
      console.error("Failed to create contact:", error);
      toast.error("Failed to create contact");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl sm:px-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-10">
        <div>
          <p className="font-medium text-2xl">Contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className={Button.buttonVariants({
              variant: "neutral",
              mode: "stroke",
              size: "xsmall",
            }).root()}
            href="https://reloop.sh/docs/contacts"
            target="_blank"
            rel="noopener noreferrer"
            title="Documentation"
          >
            <Icon name="book-closed" className="h-4 w-4" />
          </Link>
          <PopoverRoot>
            <PopoverTrigger asChild>
              <Button.Root variant="neutral" size="xsmall">
                <Icon name="plus" className="h-4 w-4" />
                Add Contact
                <Icon name="chevron-down" className="h-4 w-4" />
              </Button.Root>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" className="p-2" sideOffset={3}>
              <div className="flex flex-col gap-1">
                <Button.Root
                  variant="neutral"
                  mode="ghost"
                  size="small"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full justify-start"
                >
                  <Icon name="user-plus" className="h-4 w-4" />
                  Add Single Contact
                </Button.Root>
                <Link
                  href={`/${activeOrganization?.slug}/contacts/bulk-import`}
                  className={Button.buttonVariants({
                    variant: "neutral",
                    mode: "ghost",
                    size: "small",
                  }).root() + " w-full justify-start"}
                >
                  <Icon name="file-upload" className="h-4 w-4" />
                  Bulk Import (CSV)
                </Link>
              </div>
            </PopoverContent>
          </PopoverRoot>
        </div>
      </div>

      {/* Contacts List */}
      <div className="mt-10">
        <ContactList />
      </div>

      {/* Create Contact Modal */}
      <Modal.Root open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
          <form onSubmit={handleCreateContact}>
            <Modal.Body>
              <h2 className="mb-6 font-semibold text-gray-900 text-xl">
                Create Contact
              </h2>
              <div className="space-y-3">
                <div>
                  <Label.Root htmlFor="email">
                    Email
                    <Label.Asterisk />
                  </Label.Root>
                  <Input.Root className="mt-1">
                    <Input.Wrapper>
                      <Input.Input
                        className="px-2"
                        id="email"
                        type="email"
                        placeholder="contact@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isCreating}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label.Root htmlFor="firstName">
                      First Name
                    </Label.Root>
                    <Input.Root className="mt-1">
                      <Input.Wrapper>
                        <Input.Input
                          className="px-2"
                          id="firstName"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={isCreating}
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  </div>
                  <div>
                    <Label.Root htmlFor="lastName">
                      Last Name
                    </Label.Root>
                    <Input.Root className="mt-1">
                      <Input.Wrapper>
                        <Input.Input
                          className="px-2"
                          id="lastName"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={isCreating}
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="flex items-center justify-end gap-3">
              <Button.Root
                type="button"
                variant="neutral"
                mode="stroke"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEmail("");
                  setFirstName("");
                  setLastName("");
                }}
                disabled={isCreating}
              >
                Cancel
                <Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
              </Button.Root>
              <Button.Root
                type="submit"
                variant="neutral"
                disabled={isCreating || !email}
              >
                {isCreating ? (
                  <>
                    <Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Contact
                    <Icon name="undo" className="h-3 w-3 scale-y-[-1]" />
                  </>
                )}
              </Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
};

export default ContactsPage;
