"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";

interface EmailChip {
  id: string;
  email: string;
  isValid: boolean;
}

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const AddContactModal = ({ open, onOpenChange }: AddContactModalProps) => {
  const { mutate } = useSWRConfig();
  const [isCreating, setIsCreating] = useState(false);
  const [emailChips, setEmailChips] = useState<EmailChip[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validEmailCount = emailChips.filter((chip) => chip.isValid).length;

  // Add email chip
  const addEmailChip = useCallback((email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    if (emailChips.some((chip) => chip.email === trimmed)) {
      toast.error("Email already added");
      return;
    }

    setEmailChips((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email: trimmed, isValid: validateEmail(trimmed) },
    ]);
    setEmailInput("");
  }, [emailChips]);

  // Remove email chip
  const removeEmailChip = (id: string) => {
    setEmailChips((prev) => prev.filter((chip) => chip.id !== id));
  };

  // Handle input keydown
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addEmailChip(emailInput);
    } else if (e.key === "Backspace" && !emailInput && emailChips.length > 0) {
      const lastChip = emailChips[emailChips.length - 1];
      if (lastChip) {
        removeEmailChip(lastChip.id);
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const emails = paste.split(/[\s,;]+/).filter(Boolean);
    emails.forEach((email) => addEmailChip(email));
  };

  // Reset state when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmailChips([]);
      setEmailInput("");
    }
    onOpenChange(isOpen);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add any remaining input as chip
    if (emailInput.trim()) {
      addEmailChip(emailInput);
    }

    const validEmails = emailChips.filter((chip) => chip.isValid).map((chip) => chip.email);
    if (validEmails.length === 0) {
      toast.error("Please add at least one valid email");
      return;
    }

    setIsCreating(true);
    try {
      let created = 0;
      let skipped = 0;

      for (const email of validEmails) {
        const response = await fetch("/api/contacts/v1/contacts/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          created++;
        } else if (response.status === 409) {
          skipped++;
        }
      }

      if (created > 0) {
        toast.success(`${created} contact(s) created${skipped > 0 ? `, ${skipped} already existed` : ""}`);
      } else if (skipped > 0) {
        toast.info(`All ${skipped} contacts already exist`);
      }

      handleOpenChange(false);
      await mutate((key: string) => typeof key === 'string' && key.includes('/api/contacts/v1/contacts/list'));
    } catch (error) {
      console.error("Failed to create contacts:", error);
      toast.error("Failed to create contacts");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
        <div className="border border-stroke-soft-100/50 rounded-2xl">
          <Modal.Header className="before:border-stroke-soft-200/50">
            <div className="flex items-center justify-center">
              <Icon name="user-plus" className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <Modal.Title>Add Contacts</Modal.Title>
            </div>
          </Modal.Header>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <Modal.Body className="space-y-2">
              <div className="flex flex-col gap-1">
                <Label.Root htmlFor="emails">
                  Email addresses ...
                </Label.Root>
                <div
                  className="group/chips flex flex-wrap content-start gap-1.5 px-3 py-2.5 min-h-[82px] rounded-xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 transition duration-200 ease-out cursor-text hover:[&:not(:focus-within)]:bg-bg-weak-50 hover:[&:not(:focus-within)]:ring-transparent focus-within:shadow-button-important-focus focus-within:ring-stroke-strong-950"
                  onClick={() => inputRef.current?.focus()}
                >
                  {emailChips.map((chip) => (
                    <span
                      key={chip.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-paragraph-xs ${chip.isValid
                          ? "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950"
                          : "border-error-base bg-red-alpha-10 text-red-600"
                        }`}
                    >
                      <Icon name="mail-single" className="w-3 h-3 text-text-sub-600" />
                      {chip.email}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEmailChip(chip.id);
                        }}
                        className="ml-0.5 text-text-sub-600 hover:text-text-strong-950 transition-colors"
                        disabled={isCreating}
                      >
                        <Icon name="cross" className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={inputRef}
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onBlur={() => emailInput && addEmailChip(emailInput)}
                    placeholder={emailChips.length === 0 ? "example@email.com" : ""}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-paragraph-sm text-text-sub-600 placeholder:text-text-soft-400"
                    disabled={isCreating}
                  />
                </div>
                {emailChips.length > 0 && (
                  <p className="text-text-soft-400 text-paragraph-xs">
                    {validEmailCount} valid email{validEmailCount !== 1 ? "s" : ""}
                    {emailChips.length - validEmailCount > 0 && (
                      <span className="text-error-base">
                        {" "}• {emailChips.length - validEmailCount} invalid
                      </span>
                    )}
                  </p>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
              <Button.Root
                type="submit"
                variant="neutral"
                size="xsmall"
                disabled={isCreating || validEmailCount === 0}
              >
                {isCreating ? (
                  <>
                    <Spinner size={14} color="currentColor" />
                    Creating...
                  </>
                ) : (
                  <>
                    Add {validEmailCount > 0 ? validEmailCount : ""} Contact{validEmailCount !== 1 ? "s" : ""}
                    <Icon name="enter" className="w-4 h-4 border rounded-sm p-px border-stroke-soft-100/20" />
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
