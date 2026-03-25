"use client";

import * as Button from "@reloop/ui/button";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";

interface RevokeInviteModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isRevoking: boolean;
	inviteEmail: string;
}

export const RevokeInviteModal = ({
	open,
	onOpenChange,
	onConfirm,
	isRevoking,
	inviteEmail,
}: RevokeInviteModalProps) => {
	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="sm:max-w-[400px]" showClose={false}>
				<div className="p-5">
					<h2 className="mb-2 text-label-md text-text-strong-950">
						Revoke invite
					</h2>
					<p className="text-paragraph-sm text-text-sub-600">
						Are you sure you want to revoke this invite?
					</p>
				</div>

				<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => onOpenChange(false)}
						disabled={isRevoking}
					>
						Cancel
						<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
					</Button.Root>
					<Button.Root
						type="button"
						variant="error"
						size="xsmall"
						onClick={onConfirm}
						disabled={isRevoking}
					>
						{isRevoking ? (
							<>
								<Spinner size={14} color="currentColor" />
								Revoking...
							</>
						) : (
							"Revoke invite"
						)}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
