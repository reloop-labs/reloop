"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import {
  Content as PopoverContent,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import Spinner from "@reloop/ui/spinner";
import { ContactList } from "./components/contact-list";
import { ContactsTabs } from "./components/contacts-tabs";
import { PropertyList } from "./components/property-list";
import { AddContactModal } from "./components/add-contact-modal";
import { useQueryState } from "nuqs";

const ContactsPage = () => {
  const { activeOrganization } = useUserOrganization();
  const { mutate } = useSWRConfig();
  const [tabValue] = useQueryState("tab", { defaultValue: "contacts" });

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Property Modal State
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState<"string" | "number">("string");
  const [fallbackValue, setFallbackValue] = useState("");

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName) return;

    setIsCreatingProperty(true);
    try {
      const response = await fetch("/api/contacts/v1/properties/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: propertyName,
          type: propertyType,
          fallbackValue: fallbackValue || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create property");
      }

      toast.success("Property created successfully");
      setIsPropertyModalOpen(false);
      setPropertyName("");
      setPropertyType("string");
      setFallbackValue("");

      await mutate((key: string) => typeof key === 'string' && key.includes('/api/contacts/v1/properties/list'));
    } catch (error) {
      console.error("Failed to create property:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create property");
    } finally {
      setIsCreatingProperty(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl sm:px-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-10">
        <p className="font-medium text-2xl">Contacts</p>
        <div className="flex items-center gap-2">
          {tabValue === "contacts" ? (
            <PopoverRoot>
              <PopoverTrigger asChild>
                <Button.Root variant="neutral" size="xsmall">
                  <Icon name="plus" className="h-4 w-4" />
                  Add contact
                </Button.Root>
              </PopoverTrigger>
              <PopoverContent align="end" side="bottom" className="p-2" sideOffset={3}>
                <div className="flex flex-col gap-1">
                  <Button.Root
                    variant="neutral"
                    mode="ghost"
                    size="small"
                    onClick={() => setIsContactModalOpen(true)}
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
          ) : (
            <Button.Root
              variant="neutral"
              size="xsmall"
              onClick={() => setIsPropertyModalOpen(true)}
            >
              <Icon name="plus" className="h-4 w-4" />
              Add property
            </Button.Root>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <ContactsTabs />
      </div>

      {/* Content based on tab */}
      <div className="mt-4">
        {tabValue === "contacts" ? <ContactList /> : <PropertyList />}
      </div>

      {/* Add Contacts Modal */}
      <AddContactModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
      />

      {/* Add Property Modal */}
      <Modal.Root open={isPropertyModalOpen} onOpenChange={setIsPropertyModalOpen}>
        <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
          <div className="border border-stroke-soft-100/50 rounded-2xl">
            <Modal.Header className="before:border-stroke-soft-200/50">
              <div className="flex items-center justify-center">
                <Icon name="sliders-horiz-2" className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <Modal.Title className="text-sm">Add Property</Modal.Title>
              </div>
            </Modal.Header>
            <form onSubmit={handleCreateProperty}>
              <Modal.Body className="space-y-4">
                <div className="flex flex-col gap-1">
                  <Label.Root htmlFor="propertyName">
                    Name
                    <Label.Asterisk />
                  </Label.Root>
                  <Input.Root size="small">
                    <Input.Wrapper>
                      <Input.Input
                        id="propertyName"
                        placeholder="e.g., first_name, company_name"
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        disabled={isCreatingProperty}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label.Root htmlFor="propertyType">
                      Type
                      <Label.Asterisk />
                    </Label.Root>
                    <Select.Root
                      value={propertyType}
                      onValueChange={(value) => setPropertyType(value as "string" | "number")}
                      disabled={isCreatingProperty}
                    >
                      <Select.Trigger className="w-full">
                        <Select.Value placeholder="Select type" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="string">String</Select.Item>
                        <Select.Item value="number">Number</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label.Root htmlFor="fallbackValue">
                      Fallback Value
                    </Label.Root>
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input
                          id="fallbackValue"
                          placeholder="Default value"
                          value={fallbackValue}
                          onChange={(e) => setFallbackValue(e.target.value)}
                          disabled={isCreatingProperty}
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
                    setIsPropertyModalOpen(false);
                    setPropertyName("");
                    setPropertyType("string");
                    setFallbackValue("");
                  }}
                  disabled={isCreatingProperty}
                >
                  Cancel
                  <Kbd.Root className="bg-bg-weak-50 text-[10px]">Esc</Kbd.Root>
                </Button.Root>
                <Button.Root
                  type="submit"
                  variant="neutral"
                  size="small"
                  disabled={isCreatingProperty || !propertyName}
                >
                  {isCreatingProperty ? (
                    <>
                      <Spinner size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      Add Property
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
