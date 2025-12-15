"use client";

import * as Button from "@reloop/ui/button";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";

interface RemoveMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isRemoving: boolean;
  memberName: string;
  memberEmail: string;
}

export const RemoveMemberModal = ({
  open,
  onOpenChange,
  onConfirm,
  isRemoving,
  memberName,
  memberEmail,
}: RemoveMemberModalProps) => {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="sm:max-w-[400px]" showClose={false}>
        <div className="p-5">
          <h2 className="text-label-md text-text-strong-950 mb-2">
            Remove member
          </h2>
          <p className="text-paragraph-sm text-text-sub-600">
            Are you sure you want to remove{" "}
            <span className="font-medium text-text-strong-950">
              {memberName || memberEmail}
            </span>{" "}
            from this organization? They will lose access to all resources.
          </p>
        </div>

        <Modal.Footer className="justify-end gap-2">
          <Button.Root
            type="button"
            variant="neutral"
            mode="stroke"
            size="xsmall"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            Cancel
          </Button.Root>
          <Button.Root
            type="button"
            variant="error"
            size="xsmall"
            onClick={onConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Spinner size={14} color="currentColor" />
                Removing...
              </>
            ) : (
              "Remove member"
            )}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
