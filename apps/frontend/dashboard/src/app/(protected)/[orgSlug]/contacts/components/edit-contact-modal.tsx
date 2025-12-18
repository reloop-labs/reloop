"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useState, useEffect } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";

interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
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

export const EditContactModal = ({ open, onOpenChange, contact }: EditContactModalProps) => {
  const { mutate } = useSWRConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [propertyValues, setPropertyValues] = useState<Record<string, string>>({});

  // Fetch all custom properties for the organization
  const { data: propertiesData } = useSWR<{ properties: Property[]; total: number }>(
    open ? "/api/contacts/v1/properties/list?limit=100" : null,
    fetcher,
  );

  // Fetch property values for this contact
  const { data: contactPropsData } = useSWR<{ propertyValues: PropertyValue[] }>(
    open && contact ? `/api/contacts/v1/contacts/${contact.id}/properties` : null,
    fetcher,
  );

  // Custom properties only (firstName/lastName are now system fields on the contact)
  const customProperties = propertiesData?.properties || [];

  // Reset form when contact changes or modal opens
  useEffect(() => {
    if (open && contact) {
      setEmail(contact.email);
      setFirstName(contact.firstName || "");
      setLastName(contact.lastName || "");
      setIsSubscribed(contact.status.toLowerCase() === "subscribed");
    }
  }, [contact, open]);

  // Set custom property values when fetched
  useEffect(() => {
    if (contactPropsData?.propertyValues) {
      const values: Record<string, string> = {};
      for (const pv of contactPropsData.propertyValues) {
        values[pv.propertyId] = pv.value;
      }
      setPropertyValues(values);
    }
  }, [contactPropsData]);

  // Cmd/Ctrl + Enter to submit
  useHotkeys("enter", (e) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    setIsSaving(true);
    try {
      // Build custom properties array (firstName/lastName are now direct fields)
      const propsToUpdate: { propertyId: string; value: string }[] = [];
      for (const [propertyId, value] of Object.entries(propertyValues)) {
        if (value) {
          propsToUpdate.push({ propertyId, value });
        }
      }

      console.log("Updating contact with payload:", {
        firstName,
        lastName,
        status: isSubscribed ? "subscribed" : "unsubscribed",
        properties: propsToUpdate,
      });

      const response = await fetch(`/api/contacts/v1/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName || undefined,
          lastName: lastName || undefined,
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
                      value={email || contact?.email || ""}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSaving}
                      readOnly
                      placeholder={contact?.email || "Email address"}
                      className="cursor-not-allowed bg-bg-weak-50"
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>

              {/* Subscribed Toggle */}
              <div className="pt-2 border-t border-stroke-soft-100">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !isSaving && setIsSubscribed(!isSubscribed)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isSaving) {
                      e.preventDefault();
                      setIsSubscribed(!isSubscribed);
                    }
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${isSubscribed
                    ? 'border-neutral-base bg-neutral-alpha-10'
                    : 'border-stroke-soft-200 bg-bg-white-0 hover:border-stroke-soft-300'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-label-sm text-text-strong-950">Subscribed</span>
                    <span className="text-paragraph-xs text-text-sub-600">
                      {isSubscribed ? 'Receives broadcasts and campaigns' : 'Opted out from all communications'}
                    </span>
                  </div>
                  <div
                    className={`flex h-4.5 w-4.5 items-center justify-center rounded transition-all duration-200 ${isSubscribed
                      ? 'bg-neutral-900'
                      : 'bg-bg-white-0 border border-stroke-soft-300'
                      }`}
                  >
                    {isSubscribed && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 5L4.5 8.5L11 1.5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* First Name - System property, always shown */}
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

              {/* Last Name - System property, always shown */}
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
                            value={propertyValues[property.id]}
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
                    Updating...
                  </>
                ) : (
                  <>
                    Update
                    <span className="inline-flex items-center gap-0.5">
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
