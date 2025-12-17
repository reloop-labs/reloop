"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Switch from "@reloop/ui/switch";
import Spinner from "@reloop/ui/spinner";
import { useState, useEffect } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";

interface Contact {
  id: string;
  email: string;
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Property {
  id: string;
  name: string;
  type: string;
  fallbackValue: string | null;
}

interface PropertyValue {
  id: string;
  propertyId: string;
  value: string;
}

interface EditContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Reserved property names that always show in UI
const RESERVED_PROPERTIES = ["firstName", "lastName"];

export const EditContactModal = ({ open, onOpenChange, contact }: EditContactModalProps) => {
  const { mutate } = useSWRConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [propertyValues, setPropertyValues] = useState<Record<string, string>>({});

  // Fetch all properties for the organization
  const { data: propertiesData } = useSWR<{ properties: Property[]; total: number }>(
    open ? "/api/contacts/v1/properties/list?limit=100" : null,
    fetcher,
  );

  // Fetch property values for this contact
  const { data: contactPropsData } = useSWR<{ propertyValues: PropertyValue[] }>(
    open && contact ? `/api/contacts/v1/contacts/${contact.id}/properties` : null,
    fetcher,
  );

  const properties = propertiesData?.properties || [];

  // Filter out reserved properties from the custom list
  const customProperties = properties.filter(
    (p) => !RESERVED_PROPERTIES.includes(p.name)
  );

  // Reset form when contact changes
  useEffect(() => {
    if (contact) {
      setEmail(contact.email);
      setIsSubscribed(contact.status.toLowerCase() === "subscribed");
    }
  }, [contact]);

  // Set property values when fetched
  useEffect(() => {
    if (contactPropsData?.propertyValues && properties.length > 0) {
      const values: Record<string, string> = {};
      for (const pv of contactPropsData.propertyValues) {
        values[pv.propertyId] = pv.value;
      }
      setPropertyValues(values);

      // Find firstName and lastName properties and set their values
      const fnProp = properties.find((p) => p.name === "firstName");
      const lnProp = properties.find((p) => p.name === "lastName");

      if (fnProp && values[fnProp.id]) {
        setFirstName(values[fnProp.id] || "");
      }
      if (lnProp && values[lnProp.id]) {
        setLastName(values[lnProp.id] || "");
      }
    }
  }, [contactPropsData, properties]);

  // Cmd/Ctrl + Enter to submit
  useHotkeys("mod+enter", (e) => {
    e.preventDefault();
    if (open && !isSaving) {
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }
  }, { enableOnFormTags: ["INPUT"] });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail("");
      setIsSubscribed(true);
      setFirstName("");
      setLastName("");
      setPropertyValues({});
    }
    onOpenChange(isOpen);
  };

  const handlePropertyChange = (propertyId: string, value: string) => {
    setPropertyValues((prev) => ({
      ...prev,
      [propertyId]: value,
    }));
  };

  // Helper to create a property if it doesn't exist
  const ensurePropertyExists = async (name: string): Promise<string | null> => {
    const existing = properties.find((p) => p.name === name);
    if (existing) return existing.id;

    try {
      const response = await fetch("/api/contacts/v1/properties/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: "string" }),
      });

      if (!response.ok) {
        console.error(`Failed to create ${name} property`);
        return null;
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error(`Error creating ${name} property:`, error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    setIsSaving(true);
    try {
      // Build properties array
      const propsToUpdate: { propertyId: string; value: string }[] = [];

      // Handle firstName
      if (firstName) {
        const firstNameId = await ensurePropertyExists("firstName");
        if (firstNameId) {
          propsToUpdate.push({ propertyId: firstNameId, value: firstName });
        }
      }

      // Handle lastName
      if (lastName) {
        const lastNameId = await ensurePropertyExists("lastName");
        if (lastNameId) {
          propsToUpdate.push({ propertyId: lastNameId, value: lastName });
        }
      }

      // Add custom property values
      for (const [propertyId, value] of Object.entries(propertyValues)) {
        if (value && !propsToUpdate.some(p => p.propertyId === propertyId)) {
          propsToUpdate.push({ propertyId, value });
        }
      }

      console.log("Updating contact with payload:", {
        status: isSubscribed ? "subscribed" : "unsubscribed",
        properties: propsToUpdate,
      });

      const response = await fetch(`/api/contacts/v1/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isSubscribed ? "subscribed" : "unsubscribed",
          properties: propsToUpdate.length > 0 ? propsToUpdate : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update contact");
      }

      toast.success("Contact updated successfully");
      handleOpenChange(false);
      await mutate((key: string) => typeof key === 'string' && key.includes('/api/contacts/v1'));
    } catch (error) {
      console.error("Failed to update contact:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update contact");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
        <div className="border border-stroke-soft-100/50 rounded-2xl">
          <Modal.Header className="before:border-stroke-soft-200/50">
            <div className="flex items-center justify-center">
              <Icon name="edit-2" className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <Modal.Title>Edit Contact</Modal.Title>
            </div>
          </Modal.Header>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <Modal.Body className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <Label.Root htmlFor="email">
                  Email
                </Label.Root>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSaving}
                      readOnly
                      placeholder={email}
                      className="cursor-not-allowed bg-bg-weak-50"
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>

              {/* Subscribed Toggle */}
              <div className="flex flex-col gap-2 pt-2 border-t border-stroke-soft-100">
                <Label.Root htmlFor="subscribed">
                  Subscribed
                </Label.Root>
                <Switch.Root
                  id="subscribed"
                  checked={isSubscribed}
                  onCheckedChange={setIsSubscribed}
                  disabled={isSaving}
                />
              </div>

              {/* First Name - Always shown */}
              <div className="flex flex-col gap-1 pt-4 border-t border-stroke-soft-100">
                <Label.Root htmlFor="firstName">
                  First name
                </Label.Root>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isSaving}
                      placeholder="Your contact name"
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>

              {/* Last Name - Always shown */}
              <div className="flex flex-col gap-1">
                <Label.Root htmlFor="lastName">
                  Last name
                </Label.Root>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isSaving}
                      placeholder="Your contact last name"
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>

              {/* Custom Properties */}
              {customProperties.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-stroke-soft-100">
                  {customProperties.map((property) => (
                    <div key={property.id} className="flex flex-col gap-1">
                      <Label.Root htmlFor={`prop-${property.id}`}>
                        {property.name}
                      </Label.Root>
                      <Input.Root size="small">
                        <Input.Wrapper>
                          <Input.Input
                            id={`prop-${property.id}`}
                            type={property.type === "number" ? "number" : "text"}
                            value={propertyValues[property.id] || ""}
                            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
                            disabled={isSaving}
                            placeholder={property.fallbackValue || `Enter ${property.name}`}
                          />
                        </Input.Wrapper>
                      </Input.Root>
                    </div>
                  ))}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
              <Button.Root
                type="submit"
                variant="neutral"
                size="xsmall"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Spinner size={14} color="currentColor" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save
                    <span className="inline-flex items-center gap-0.5">
                      <Icon name="command" className="w-4 h-4 border rounded-sm p-px border-stroke-soft-100/20" />
                      <Icon name="enter" className="w-4 h-4 border rounded-sm p-px border-stroke-soft-100/20" />
                    </span>
                  </>
                )}
              </Button.Root>
            </Modal.Footer>
          </form>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
