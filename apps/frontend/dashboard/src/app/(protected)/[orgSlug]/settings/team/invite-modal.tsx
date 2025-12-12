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
import * as Textarea from "@reloop/ui/textarea";
import * as Label from "@reloop/ui/label";

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
              {/* Email Textarea */}
              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='email'>
                  Send Invite to ...
                </Label.Root>
                <Textarea.Root
                  {...form.register("emails")}
                  placeholder="example@email.com"
                  disabled={loading}
                  id='email'
                  className="text-sm text-text-sub-700 placeholder:text-sm placeholder:text-text-sub-200"

                />
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
                    <Select.Item value="member" className="h-7">Member</Select.Item>
                    <Select.Item value="admin" className="h-7">Admin</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>


            </Modal.Body>

            {/* Footer */}
            <Modal.Footer className="justify-end border-stroke-soft-100/50">
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
