"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const editApiKeySchema = v.object({
  name: v.optional(
    v.pipe(v.string(), v.minLength(1, "Name must be at least 1 character")),
  ),
});

type EditApiKeyFormValues = v.InferInput<typeof editApiKeySchema>;

interface ApiKeyData {
  id: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  enabled: boolean;
  rateLimitEnabled: boolean;
  rateLimitTimeWindow: number;
  rateLimitMax: number;
  expiresAt: string | null;
  permissions: string | null;
}

interface EditApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: ApiKeyData;
}

export const EditApiKeyModal = ({
  isOpen,
  onClose,
  apiKey,
}: EditApiKeyModalProps) => {
  const { changeStatus, status } = useLoading();
  const { mutate } = useSWRConfig();

  const { register, handleSubmit, formState, reset } =
    useForm<EditApiKeyFormValues>({
      resolver: valibotResolver(editApiKeySchema) as Resolver<EditApiKeyFormValues>,
      defaultValues: {
        name: apiKey.name || "",
      },
    });

  const onSubmit = async (data: EditApiKeyFormValues) => {
    try {
      changeStatus("loading");
      const payload: Record<string, unknown> = {};

      if (data.name !== undefined && data.name !== apiKey.name) {
        payload.name = data.name;
      }

      await axios.patch(`/api/api-key/v1/${apiKey.id}`, payload, {
        headers: { credentials: "include" },
      });

      await mutate(`/api/api-key/v1/${apiKey.id}`);
      await mutate("/api/api-key/v1/?limit=100");

      toast.success("API key updated successfully");
      changeStatus("idle");
      onClose();
    } catch (error) {
      changeStatus("idle");
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update API key"
        : "Failed to update API key";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={handleClose}>
      <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
        <div className="border border-stroke-soft-100/50 rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Header className="before:border-stroke-soft-200/50">
              <div className="flex items-center justify-center">
                <Icon name="edit-2" className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <Modal.Title>Edit API Key</Modal.Title>
              </div>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              <p className="text-text-sub-600 text-sm">
                Update the name for this API key.
              </p>

              <div className="flex flex-col gap-1">
                <Label.Root htmlFor="name">
                  Name
                  <Label.Asterisk />
                </Label.Root>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input
                      className="px-2"
                      id="name"
                      placeholder="e.g., Production Server, My App"
                      {...register("name")}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {formState.errors.name && (
                  <p className="text-error-base text-paragraph-xs">
                    {formState.errors.name.message}
                  </p>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
              <Button.Root
                type="submit"
                variant="neutral"
                size="xsmall"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Icon name="loader-2" className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Changes
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
