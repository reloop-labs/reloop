"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useState, useRef } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";
import * as Label from "@reloop/ui/label";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";

const formSchema = v.object({
  emails: v.pipe(
    v.string("Email is required"),
    v.minLength(1, "Please enter at least one email"),
  ),
  role: v.picklist(["admin", "member"], "Please select a valid role"),
  team: v.optional(v.string()),
});

type InviteValues = v.InferInput<typeof formSchema>;

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleOptions = [
  { value: "member" as const, label: "Member" },
  { value: "admin" as const, label: "Admin" },
];

export const InviteModal = ({ open, onOpenChange }: InviteModalProps) => {
  const [loading, setLoading] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
  const [emailChips, setEmailChips] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const itemRefs = useRef<HTMLButtonElement[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useSWRConfig();
  const { data: session } = authClient.useSession();

  const currentTab = itemRefs.current[hoverIdx ?? -1];
  const currentRect = currentTab?.getBoundingClientRect();

  const form = useForm<InviteValues>({
    resolver: valibotResolver(formSchema) as Resolver<InviteValues>,
    defaultValues: {
      emails: "",
      role: "member",
      team: "",
    },
  });

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Add email chip
  const addEmailChip = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail && isValidEmail(trimmedEmail) && !emailChips.includes(trimmedEmail)) {
      const newChips = [...emailChips, trimmedEmail];
      setEmailChips(newChips);
      form.setValue("emails", newChips.join(","));
      setInputValue("");
    } else if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address");
    }
  };

  // Remove email chip
  const removeEmailChip = (emailToRemove: string) => {
    const newChips = emailChips.filter((email) => email !== emailToRemove);
    setEmailChips(newChips);
    form.setValue("emails", newChips.join(","));
  };

  // Handle input keydown
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " " || e.key === "Tab") {
      e.preventDefault();
      addEmailChip(inputValue);
    } else if (e.key === "Backspace" && !inputValue && emailChips.length > 0) {
      // Remove last chip on backspace if input is empty
      removeEmailChip(emailChips[emailChips.length - 1]!);
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const emails = pastedText.split(/[,\n\s]+/).filter((email) => email.trim());
    for (const email of emails) {
      const trimmedEmail = email.trim().toLowerCase();
      if (isValidEmail(trimmedEmail) && !emailChips.includes(trimmedEmail)) {
        setEmailChips((prev) => {
          const newChips = [...prev, trimmedEmail];
          form.setValue("emails", newChips.join(","));
          return newChips;
        });
      }
    }
    setInputValue("");
  };

  // Reset chips when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmailChips([]);
      setInputValue("");
      form.reset();
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: InviteValues) => {
    if (!session?.user.activeOrganizationId) return;
    setLoading(true);

    // Use emailChips directly instead of parsing
    if (emailChips.length === 0) {
      toast.error("Please enter at least one valid email address");
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.allSettled(
        emailChips.map((email) =>
          authClient.organization.inviteMember({
            email,
            role: data.role,
            organizationId: session?.user.activeOrganizationId ?? undefined,
          }),
        ),
      );

      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failCount = results.filter((r) => r.status === "rejected").length;

      if (successCount > 0) {
        toast.success(
          `${successCount} invitation${successCount > 1 ? "s" : ""} sent successfully!`,
        );
        form.reset({ emails: "", role: "member", team: "" });
        setEmailChips([]);
        setInputValue("");
        mutate((key) => typeof key === "string" && key.startsWith("invitations-"));
        handleOpenChange(false);
      }

      if (failCount > 0) {
        toast.error(`${failCount} invitation${failCount > 1 ? "s" : ""} failed`);
      }
    } catch (error) {
      toast.error("Failed to invite team members");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
        <div className="border border-stroke-soft-100/50 rounded-2xl">
          <Modal.Header className='before:border-stroke-soft-200/50'>
            <div className="flex items-center justify-centers">
              <Icon name="user-plus" className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <Modal.Title>Invite team members</Modal.Title>
            </div>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            <Modal.Body className="space-y-2">
              {/* Email Chips Input */}
              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='email'>
                  Send Invite to ...
                </Label.Root>
                <div
                  className={cn(
                    "group/chips flex flex-wrap content-start gap-1.5 px-3 py-2.5 min-h-[82px] rounded-xl bg-bg-white-0 shadow-regular-xs",
                    "ring-1 ring-stroke-soft-200 ring-inset",
                    "transition duration-200 ease-out cursor-text",
                    // hover
                    "hover:[&:not(:focus-within)]:bg-bg-weak-50 hover:[&:not(:focus-within)]:ring-transparent",
                    // focus
                    "focus-within:shadow-button-important-focus focus-within:ring-stroke-strong-950"
                  )}
                  onClick={() => inputRef.current?.focus()}
                >
                  {emailChips.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-stroke-soft-200 bg-bg-weak-50 text-paragraph-xs text-text-strong-950"
                    >
                      <Icon name="mail" className="w-3 h-3 text-text-sub-600" />
                      {email}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEmailChip(email);
                        }}
                        className="ml-0.5 text-text-sub-600 hover:text-text-strong-950 transition-colors"
                        disabled={loading}
                      >
                        <Icon name="cross" className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    onPaste={handlePaste}
                    onBlur={() => {
                      if (inputValue.trim()) {
                        addEmailChip(inputValue);
                      }
                    }}
                    placeholder={emailChips.length === 0 ? "example@email.com" : ""}
                    disabled={loading}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-paragraph-xs text-text-sub-600 placeholder:text-text-soft-400"
                  />
                </div>
                {form.formState.errors.emails && (
                  <p className="text-error-base text-paragraph-xs">
                    {form.formState.errors.emails.message}
                  </p>
                )}
              </div>

              {/* Role Select */}
              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='role'>
                  Invite as
                </Label.Root>
                <Select.Root
                  size="small"
                  defaultValue="member"
                  disabled={loading}
                  onValueChange={(value: "admin" | "member") => {
                    form.setValue("role", value);
                  }}
                >
                  <Select.Trigger className="w-full text-paragraph-xs">
                    <Select.Value placeholder="Select role" />
                  </Select.Trigger>
                  <Select.Content className="text-paragraph-xs min-w-[var(--radix-select-trigger-width)]">
                    <div className="relative">
                      {roleOptions.map((option, idx) => (
                        <Select.Item
                          key={option.value}
                          value={option.value}
                          className="h-8 data-[highlighted]:bg-transparent"
                          ref={(el) => {
                            if (el) itemRefs.current[idx] = el as unknown as HTMLButtonElement;
                          }}
                          onPointerEnter={() => setHoverIdx(idx)}
                          onPointerLeave={() => setHoverIdx(undefined)}
                        >
                          {option.label}
                        </Select.Item>
                      ))}
                      <AnimatedHoverBackground
                        rect={currentRect}
                        tabElement={currentTab}
                      />
                    </div>
                  </Select.Content>
                </Select.Root>
              </div>


            </Modal.Body>

            {/* Footer */}
            <Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
              <Button.Root
                type="submit"
                variant="neutral"
                size="xsmall"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size={14} color="white" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Invites
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
