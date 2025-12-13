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
      const response = await fetch("/api/audience/v1/contacts/add", {
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
        <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
          <div className="border border-stroke-soft-100/50 rounded-2xl">
            <Modal.Header className="before:border-stroke-soft-200/50">
              <div className="flex items-center justify-center">
                <Icon name="user-plus" className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <Modal.Title className="text-sm">Add Contact</Modal.Title>
              </div>
            </Modal.Header>
            <form onSubmit={handleCreateContact}>
              <Modal.Body className="space-y-4">
                <div className="flex flex-col gap-1">
                  <Label.Root htmlFor="email">
                    Email
                    <Label.Asterisk />
                  </Label.Root>
                  <Input.Root size="small">
                    <Input.Wrapper>
                      <Input.Input
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
                  <div className="flex flex-col gap-1">
                    <Label.Root htmlFor="firstName">
                      First Name
                    </Label.Root>
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input
                          id="firstName"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={isCreating}
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label.Root htmlFor="lastName">
                      Last Name
                    </Label.Root>
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input
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
              </Modal.Body>
              <Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
                <Button.Root
                  type="button"
                  variant="neutral"
                  mode="stroke"
                  size="small"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEmail("");
                    setFirstName("");
                    setLastName("");
                  }}
                  disabled={isCreating}
                >
                  Cancel
                  <Kbd.Root className="bg-bg-weak-50 text-[10px]">Esc</Kbd.Root>
                </Button.Root>
                <Button.Root
                  type="submit"
                  variant="neutral"
                  size="small"
                  disabled={isCreating || !email}
                >
                  {isCreating ? (
                    <>
                      <Icon name="loader" className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Add Contact
                      <Icon name="enter" className="w-4 h-4 border rounded-sm p-px border-stroke-soft-100/20" />
                    </>
                  )}
                </Button.Root>
              </Modal.Footer>
            </form>
          </div>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
};

export default ContactsPage;
