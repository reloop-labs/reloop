"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";
import Spinner from "@reloop/ui/spinner";

const addContactSchema = v.object({
  email: v.pipe(
    v.string("Email is required"),
    v.email("Please enter a valid email address"),
  ),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
});

type AddContactFormValues = v.InferInput<typeof addContactSchema>;

interface AddContactProps {
  topicId: string;
  topicName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddContact = ({
  topicId,
  topicName,
  open,
  onOpenChange,
}: AddContactProps) => {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState, setError, reset } =
    useForm<AddContactFormValues>({
      resolver: valibotResolver(addContactSchema) as Resolver<AddContactFormValues>,
      defaultValues: {
        email: "",
        firstName: "",
        lastName: "",
      },
    });

  const onSubmit = async ({ email, firstName, lastName }: AddContactFormValues) => {
    try {
      setIsLoading(true);
      await axios.post(
        "/api/contacts/v1/contacts/add-to-topic",
        {
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          topicId,
        },
        { withCredentials: true },
      );
      await mutate((key: string) => typeof key === 'string' && key.startsWith(`/api/contacts/v1/subscriptions/list?topicId=${topicId}`));
      toast.success("Contact added successfully");
      reset();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to add contact"
        : "Failed to add contact";
      toast.error(errorMessage);
      setError("email", {
        type: "manual",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
        <div className="border border-stroke-soft-100/50 rounded-2xl">
          <Modal.Header className="before:border-stroke-soft-200/50">
            <div className="flex items-center justify-center">
              <Icon name="user-plus" className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <Modal.Title className="text-sm">Add Contact to "{topicName}"</Modal.Title>
            </div>
          </Modal.Header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body className="space-y-4">
              <div className="flex flex-col gap-1">
                <Label.Root htmlFor="email">
                  Email
                  <Label.Asterisk />
                </Label.Root>
                <Input.Root size="small" hasError={!!formState.errors.email}>
                  <Input.Wrapper>
                    <Input.Input
                      id="email"
                      type="email"
                      placeholder="contact@example.com"
                      {...register("email")}
                      disabled={isLoading}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {formState.errors.email && (
                  <p className="text-error-base text-paragraph-xs">
                    {formState.errors.email.message}
                  </p>
                )}
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
                        {...register("firstName")}
                        disabled={isLoading}
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
                        {...register("lastName")}
                        disabled={isLoading}
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
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
                <Kbd.Root className="bg-bg-weak-50 text-[10px]">Esc</Kbd.Root>
              </Button.Root>
              <Button.Root
                type="submit"
                variant="neutral"
                size="small"
                disabled={isLoading || !formState.isValid}
              >
                {isLoading ? (
                  <>
                    <Spinner size={16} />
                    Adding...
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
  );
};

