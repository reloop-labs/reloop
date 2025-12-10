"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

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

export const InviteModal = ({ open, onOpenChange }: InviteModalProps) => {
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();
  const { data: session } = authClient.useSession();

  const form = useForm<InviteValues>({
    resolver: valibotResolver(formSchema) as Resolver<InviteValues>,
    defaultValues: {
      emails: "",
      role: "member",
      team: "",
    },
  });

  const onSubmit = async (data: InviteValues) => {
    if (!session?.user.activeOrganizationId) return;
    setLoading(true);

    // Parse emails - split by comma, newline, or space
    const emails = data.emails
      .split(/[,\n\s]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && email.includes("@"));

    if (emails.length === 0) {
      toast.error("Please enter at least one valid email address");
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.allSettled(
        emails.map((email) =>
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
        mutate((key) => typeof key === "string" && key.startsWith("invitations-"));
        onOpenChange(false);
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
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="sm:max-w-[480px]" showClose={false}>
        {/* Header */}
        <Modal.Header>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 ring-1 ring-stroke-soft-200 ring-inset">
            <Icon name="user-plus" className="size-5 text-text-sub-600" />
          </div>
          <div className="flex-1">
            <Modal.Title>Invite team members</Modal.Title>
          </div>
        </Modal.Header>

        {/* Body */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <Modal.Body className="space-y-5">
            {/* Email Textarea */}
            <div className="space-y-1.5">
              <label className="text-paragraph-sm text-text-sub-600">
                Send Invite to ...
              </label>
              <textarea
                {...form.register("emails")}
                placeholder="example@email.com"
                disabled={loading}
                className={cn(
                  "w-full min-h-[100px] px-3 py-2.5 rounded-lg",
                  "bg-bg-white-0 border border-stroke-soft-200",
                  "text-paragraph-sm text-text-strong-950 placeholder:text-text-sub-600",
                  "focus:outline-none focus:ring-2 focus:ring-primary-base/20 focus:border-primary-base",
                  "resize-none transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
              {form.formState.errors.emails && (
                <p className="text-error-base text-paragraph-xs">
                  {form.formState.errors.emails.message}
                </p>
              )}
            </div>

            {/* Role Select */}
            <div className="space-y-1.5">
              <label className="text-paragraph-sm text-text-sub-600">
                Invite as
              </label>
              <Select.Root
                defaultValue="member"
                disabled={loading}
                onValueChange={(value: "admin" | "member") => {
                  form.setValue("role", value);
                }}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Select role" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="member">Member</Select.Item>
                  <Select.Item value="admin">Admin</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>

            {/* Team Select */}
            <div className="space-y-1.5">
              <label className="text-paragraph-sm text-text-sub-600">
                Add to team <span className="text-text-disabled-300">(optional)</span>
              </label>
              <Select.Root
                disabled={loading}
                onValueChange={(value: string) => {
                  form.setValue("team", value);
                }}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Search or create a team" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="engineering">Engineering</Select.Item>
                  <Select.Item value="design">Design</Select.Item>
                  <Select.Item value="marketing">Marketing</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
          </Modal.Body>

          {/* Footer */}
          <Modal.Footer className="justify-end">
            <Button.Root
              type="submit"
              variant="primary"
              size="small"
              disabled={loading}
            >
              {loading && <Spinner size={14} color="white" />}
              {loading ? "Sending..." : "Send Invites"}
              {!loading && <Icon name="corner-down-left" className="h-4 w-4" />}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};
