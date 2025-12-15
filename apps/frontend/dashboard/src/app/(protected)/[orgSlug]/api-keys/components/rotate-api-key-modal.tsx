"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface ApiKeyWithKeyResponse {
  id: string;
  name: string | null;
  key: string;
  start: string | null;
  prefix: string | null;
  enabled: boolean;
  createdAt: string;
}

interface RotateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyId: string;
  apiKeyName: string;
}

export const RotateApiKeyModal = ({
  isOpen,
  onClose,
  apiKeyId,
  apiKeyName,
}: RotateApiKeyModalProps) => {
  const [isRotating, setIsRotating] = useState(false);
  const [rotatedApiKey, setRotatedApiKey] = useState<ApiKeyWithKeyResponse | null>(null);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const { mutate } = useSWRConfig();

  const handleRotate = async () => {
    try {
      setIsRotating(true);
      const response = await axios.post<ApiKeyWithKeyResponse>(
        `/api/api-key/v1/${apiKeyId}/rotate`,
        {},
        { headers: { credentials: "include" } },
      );

      setRotatedApiKey(response.data);
      await mutate(`/api/api-key/v1/${apiKeyId}`);
      await mutate("/api/api-key/v1/?limit=100");
      toast.success("API key rotated successfully");
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to rotate API key"
        : "Failed to rotate API key";
      toast.error(errorMessage);
    } finally {
      setIsRotating(false);
    }
  };

  const handleCopyKey = async () => {
    if (rotatedApiKey?.key) {
      try {
        await navigator.clipboard.writeText(rotatedApiKey.key);
        toast.success("API key copied to clipboard");
      } catch {
        toast.error("Failed to copy API key");
      }
    }
  };

  const handleClose = () => {
    setRotatedApiKey(null);
    setKeyRevealed(false);
    onClose();
  };

  // Show new key reveal screen after rotation
  if (rotatedApiKey) {
    return (
      <Modal.Root open={isOpen} onOpenChange={handleClose}>
        <Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
          <Modal.Body>
            <h2 className="mb-2 font-semibold text-gray-900 text-xl">
              API Key Rotated
            </h2>
            <p className="mb-4 text-gray-600 text-sm">
              Your API key has been rotated. Make sure to copy the new key now.
              You won't be able to see it again!
            </p>

            <div className="mb-4 space-y-2">
              <Label.Root className="font-medium text-sm">New API Key</Label.Root>
              <div className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3">
                {keyRevealed ? (
                  <>
                    <code className="flex-1 break-all font-mono text-xs">
                      {rotatedApiKey.key}
                    </code>
                    <Button.Root
                      variant="neutral"
                      mode="ghost"
                      size="xxsmall"
                      onClick={handleCopyKey}
                    >
                      <Icon name="clipboard-copy" className="h-4 w-4" />
                    </Button.Root>
                  </>
                ) : (
                  <>
                    <code className="flex-1 font-mono text-xs">
                      {"•".repeat(40)}
                    </code>
                    <Button.Root
                      variant="neutral"
                      mode="ghost"
                      size="xxsmall"
                      onClick={() => setKeyRevealed(true)}
                    >
                      <Icon name="eye" className="h-4 w-4" />
                      Reveal
                    </Button.Root>
                  </>
                )}
              </div>
              {keyRevealed && (
                <p className="text-red-600 text-xs">
                  ⚠️ This is your only chance to copy the new API key. The old
                  key is no longer valid.
                </p>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="flex items-center justify-end gap-3">
            <Button.Root
              type="button"
              variant="neutral"
              onClick={handleClose}
              disabled={!keyRevealed}
            >
              Done
              <Icon name="check" className="h-3 w-3" />
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    );
  }

  return (
    <Modal.Root open={isOpen} onOpenChange={handleClose}>
      <Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
        <Modal.Body>
          <h2 className="mb-2 font-semibold text-gray-900 text-xl">
            Rotate API Key
          </h2>
          <p className="mb-4 text-gray-600 text-sm">
            Are you sure you want to rotate this API key?
          </p>

          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 text-sm">Warning</p>
                <p className="text-amber-700 text-xs">
                  This will generate a new secret for "{apiKeyName}". The old key
                  will stop working immediately. Any applications using this key
                  will need to be updated.
                </p>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex items-center justify-end gap-3">
          <Button.Root
            type="button"
            variant="neutral"
            mode="stroke"
            onClick={handleClose}
            disabled={isRotating}
          >
            Cancel
            <Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
          </Button.Root>
          <Button.Root
            type="button"
            variant="primary"
            onClick={handleRotate}
            disabled={isRotating}
          >
            {isRotating ? (
              <>
                <Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
                Rotating...
              </>
            ) : (
              <>
                <Icon name="rotate-cw" className="h-4 w-4" />
                Rotate Key
              </>
            )}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
