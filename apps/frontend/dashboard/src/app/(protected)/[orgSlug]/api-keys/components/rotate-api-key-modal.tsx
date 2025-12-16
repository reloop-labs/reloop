"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useState, useEffect } from "react";
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
  const [keyCopied, setKeyCopied] = useState(false);
  const { mutate } = useSWRConfig();

  // Block browser refresh/close when key is rotated but not copied
  useEffect(() => {
    if (rotatedApiKey && !keyCopied) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "You haven't copied your new API key yet. Are you sure you want to leave?";
        return e.returnValue;
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [rotatedApiKey, keyCopied]);

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
        setKeyCopied(true);
        toast.success("API key copied to clipboard");
      } catch {
        toast.error("Failed to copy API key");
      }
    }
  };

  const handleClose = () => {
    // Only allow closing if the key has been copied
    if (!rotatedApiKey || keyCopied) {
      setRotatedApiKey(null);
      setKeyCopied(false);
      onClose();
    }
  };

  // Prevent closing via modal interactions when key is not copied
  const handleOpenChange = (open: boolean) => {
    if (!open && rotatedApiKey && !keyCopied) {
      // Prevent closing - show a warning toast
      toast.warning("Please copy your API key before closing");
      return;
    }
    if (!open) {
      handleClose();
    }
  };

  // Show new key reveal screen after rotation
  if (rotatedApiKey) {
    return (
      <Modal.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Modal.Content
          className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl"
          showClose={keyCopied}
          onEscapeKeyDown={(e) => {
            if (!keyCopied) {
              e.preventDefault();
              toast.warning("Please copy your API key before closing");
            }
          }}
          onPointerDownOutside={(e) => {
            if (!keyCopied) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            if (!keyCopied) {
              e.preventDefault();
            }
          }}
        >
          <div className="border border-stroke-soft-100/50 rounded-2xl">
            <Modal.Header className="before:border-stroke-soft-200/50">
              <div className="flex items-center justify-center">
                <Icon name="check-circle" className="h-4 w-4 text-success-base" />
              </div>
              <div className="flex-1">
                <Modal.Title>API Key Rotated</Modal.Title>
              </div>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              <p className="text-text-sub-600 text-sm">
                Your API key has been rotated. Make sure to copy the new key now.
                You won't be able to see it again!
              </p>

              <div className="space-y-2">
                <Label.Root>New API Key</Label.Root>
                <div className="flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3">
                  <code className="flex-1 break-all font-mono text-xs text-text-strong-950">
                    {rotatedApiKey.key}
                  </code>
                  <Button.Root
                    variant="neutral"
                    mode="ghost"
                    size="xxsmall"
                    onClick={handleCopyKey}
                    disabled={keyCopied}
                  >
                    <Icon name={keyCopied ? "check" : "clipboard-copy"} className={`h-4 w-4 ${keyCopied ? "text-success-base" : ""}`} />
                  </Button.Root>
                </div>
                {!keyCopied && (
                  <p className="text-error-base text-xs flex items-center gap-1">
                    <Icon name="alert-triangle" className="h-3 w-3" />
                    You must copy the API key before you can close this dialog.
                  </p>
                )}
                {keyCopied && (
                  <p className="text-success-base text-xs flex items-center gap-1">
                    <Icon name="check-circle" className="h-3 w-3" />
                    API key copied! You can now close this dialog.
                  </p>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
              <Button.Root
                type="button"
                variant="neutral"
                size="xsmall"
                onClick={handleClose}
                disabled={!keyCopied}
              >
                Done
                <Icon name="thumbs-up" className="h-3.5 w-3.5" />
              </Button.Root>
            </Modal.Footer>
          </div>
        </Modal.Content>
      </Modal.Root>
    );
  }

  return (
    <Modal.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
        <div className="border border-stroke-soft-100/50 rounded-2xl">
          <Modal.Header className="before:border-stroke-soft-200/50">
            <div className="flex items-center justify-centers">
              <Icon name="rotate-cw" className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <Modal.Title>Rotate API Key</Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body className="space-y-4">
            <p className="text-text-sub-600 text-sm">
              Are you sure you want to rotate this API key?
            </p>

            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              <div className="flex items-start justify-start gap-2">
                <Icon name="alert-triangle" className="text-error-base h-6 w-6" />
                <div>
                  <p className="font-medium text-error-base text-sm">Warning</p>
                  <p className="text-error-base/80 text-xs">
                    This will generate a new secret for "{apiKeyName}". The old key
                    will stop working immediately. Any applications using this key
                    will need to be updated.
                  </p>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
            <Button.Root
              type="button"
              variant="neutral"
              size="xsmall"
              onClick={handleRotate}
              disabled={isRotating}
            >
              {isRotating ? (
                <>
                  <Spinner size={14} color="currentColor" />
                  Rotating...
                </>
              ) : (
                <>
                  Rotate Key
                  <Icon name="rotate-cw" className="h-3 w-3" />
                </>
              )}
            </Button.Root>
          </Modal.Footer>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
