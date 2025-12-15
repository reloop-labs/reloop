"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
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
  expiresAt: v.optional(v.union([v.string(), v.null()])),
  enabled: v.optional(v.boolean()),
  rateLimitEnabled: v.optional(v.boolean()),
  rateLimitMax: v.optional(v.pipe(v.number(), v.minValue(0, "Must be >= 0"))),
  rateLimitTimeWindow: v.optional(
    v.pipe(v.number(), v.minValue(0, "Must be >= 0")),
  ),
  permissions: v.optional(v.union([v.string(), v.null()])),
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

  const { register, handleSubmit, formState, reset, watch } =
    useForm<EditApiKeyFormValues>({
      resolver: valibotResolver(editApiKeySchema) as Resolver<EditApiKeyFormValues>,
      defaultValues: {
        name: apiKey.name || "",
        expiresAt: apiKey.expiresAt
          ? new Date(apiKey.expiresAt).toISOString().slice(0, 16)
          : "",
        enabled: apiKey.enabled,
        rateLimitEnabled: apiKey.rateLimitEnabled,
        rateLimitMax: apiKey.rateLimitMax,
        rateLimitTimeWindow: apiKey.rateLimitTimeWindow,
        permissions: apiKey.permissions || "",
      },
    });

  const rateLimitEnabled = watch("rateLimitEnabled");

  const onSubmit = async (data: EditApiKeyFormValues) => {
    try {
      changeStatus("loading");
      const payload: Record<string, unknown> = {};

      if (data.name !== undefined && data.name !== apiKey.name) {
        payload.name = data.name;
      }
      if (data.expiresAt !== undefined) {
        payload.expiresAt = data.expiresAt || null;
      }
      if (data.enabled !== undefined && data.enabled !== apiKey.enabled) {
        payload.enabled = data.enabled;
      }
      if (data.rateLimitEnabled !== undefined) {
        payload.rateLimitEnabled = data.rateLimitEnabled;
      }
      if (data.rateLimitMax !== undefined) {
        payload.rateLimitMax = data.rateLimitMax;
      }
      if (data.rateLimitTimeWindow !== undefined) {
        payload.rateLimitTimeWindow = data.rateLimitTimeWindow;
      }
      if (data.permissions !== undefined) {
        payload.permissions = data.permissions || null;
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
      <Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <h2 className="mb-6 font-semibold text-gray-900 text-xl">
              Edit API Key
            </h2>
            <div className="space-y-3">
              <div>
                <Label.Root htmlFor="name">
                  Name
                  <Label.Asterisk />
                </Label.Root>
                <Input.Root className="mt-1">
                  <Input.Wrapper>
                    <Input.Input
                      className="px-2"
                      id="name"
                      placeholder="My API Key"
                      {...register("name")}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {formState.errors.name && (
                  <p className="mt-1 text-red-600 text-sm">
                    {formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label.Root htmlFor="expiresAt">
                  Expires At
                </Label.Root>
                <Input.Root className="mt-1">
                  <Input.Wrapper>
                    <Input.Input
                      className="px-2"
                      id="expiresAt"
                      type="datetime-local"
                      {...register("expiresAt")}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {formState.errors.expiresAt && (
                  <p className="mt-1 text-red-600 text-sm">
                    {formState.errors.expiresAt.message}
                  </p>
                )}
              </div>

              <div>
                <Label.Root
                  htmlFor="enabled"
                  className="flex items-center gap-2"
                >
                  <input
                    id="enabled"
                    type="checkbox"
                    {...register("enabled")}
                    className="rounded"
                  />
                  <span>Enabled</span>
                </Label.Root>
              </div>

              <div className="space-y-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3">
                <div>
                  <Label.Root
                    htmlFor="rateLimitEnabled"
                    className="flex items-center gap-2"
                  >
                    <input
                      id="rateLimitEnabled"
                      type="checkbox"
                      {...register("rateLimitEnabled")}
                      className="rounded"
                    />
                    <span>Enable Rate Limiting</span>
                  </Label.Root>
                </div>

                {rateLimitEnabled && (
                  <>
                    <div>
                      <Label.Root htmlFor="rateLimitMax">
                        Max Requests
                        <Label.Asterisk />
                      </Label.Root>
                      <Input.Root className="mt-1">
                        <Input.Wrapper>
                          <Input.Input
                            className="px-2"
                            id="rateLimitMax"
                            type="number"
                            placeholder="1000"
                            {...register("rateLimitMax", {
                              valueAsNumber: true,
                            })}
                          />
                        </Input.Wrapper>
                      </Input.Root>
                      {formState.errors.rateLimitMax && (
                        <p className="mt-1 text-red-600 text-sm">
                          {formState.errors.rateLimitMax.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label.Root htmlFor="rateLimitTimeWindow">
                        Time Window (ms)
                        <Label.Asterisk />
                      </Label.Root>
                      <Input.Root className="mt-1">
                        <Input.Wrapper>
                          <Input.Input
                            className="px-2"
                            id="rateLimitTimeWindow"
                            type="number"
                            placeholder="60000"
                            {...register("rateLimitTimeWindow", {
                              valueAsNumber: true,
                            })}
                          />
                        </Input.Wrapper>
                      </Input.Root>
                      {formState.errors.rateLimitTimeWindow && (
                        <p className="mt-1 text-red-600 text-sm">
                          {formState.errors.rateLimitTimeWindow.message}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div>
                <Label.Root htmlFor="permissions">
                  Permissions
                </Label.Root>
                <Input.Root className="mt-1">
                  <Input.Wrapper>
                    <Input.Input
                      className="px-2"
                      id="permissions"
                      placeholder="read,write"
                      {...register("permissions")}
                    />
                  </Input.Wrapper>
                </Input.Root>
                <p className="mt-1 text-gray-500 text-xs">
                  Comma-separated list of permissions
                </p>
                {formState.errors.permissions && (
                  <p className="mt-1 text-red-600 text-sm">
                    {formState.errors.permissions.message}
                  </p>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="flex items-center justify-end gap-3">
            <Button.Root
              type="button"
              variant="neutral"
              mode="stroke"
              onClick={handleClose}
              disabled={status === "loading"}
            >
              Cancel
              <Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
            </Button.Root>
            <Button.Root
              type="submit"
              variant="neutral"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <Icon name="check" className="h-3 w-3" />
                </>
              )}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};
