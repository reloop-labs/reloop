
import {
	getAvatarGradient,
	getAvatarInitial,
} from "#/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import * as FancyButton from "@reloop/ui/fancy-button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";

interface RevokeInviteModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isRevoking: boolean;
	inviteEmail: string;
	inviteRole?: string;
	invitedAt?: Date | string;
}

export const RevokeInviteModal = ({
	open,
	onOpenChange,
	onConfirm,
	isRevoking,
	inviteEmail,
	inviteRole = "member",
	invitedAt,
}: RevokeInviteModalProps) => {
	const getRelativeTime = (date?: Date | string) => {
		if (!date) return "";
		const days = Math.floor(
			(Date.now() - new Date(date).getTime()) / (1000 * 3600 * 24),
		);
		if (days === 0) return "today";
		if (days === 1) return "1 day ago";
		return `${days} days ago`;
	};

	const getRoleTextColor = (role: string) => {
		switch (role.toLowerCase()) {
			case "owner":
				return "text-warning-base";
			case "admin":
				return "text-feature-base";
			default:
				return "text-text-sub-600";
		}
	};

	const timeText = getRelativeTime(invitedAt);

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="!p-0 sm:max-w-[420px]" showClose={false}>
				<div className="flex flex-col gap-4 p-5 pb-5 sm:p-6">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-base/10 text-error-base">
						<Icon name="bell-off" className="h-6 w-6" />
					</div>

					<div className="flex flex-col space-y-2 text-left">
						<Modal.Title className="font-semibold text-base text-text-strong-950">
							Revoke invite?
						</Modal.Title>
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
							This invite will be permanently invalidated. The recipient won't
							be able to use the link to join, and you'll need to send a new
							invite if you change your mind.
						</p>
					</div>

					<div className="mt-1 mb-2 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/80 p-3 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
						<Avatar.Root size="32" color="gray" className="flex-shrink-0">
							<Avatar.Image asChild>
								<div
									className={cn(
										"flex h-full w-full items-center justify-center rounded-full font-semibold text-[11px] text-white uppercase tracking-wide shadow-sm",
										getAvatarGradient(inviteEmail),
									)}
								>
									{getAvatarInitial(null, inviteEmail)}
								</div>
							</Avatar.Image>
						</Avatar.Root>
						<div className="min-w-0 flex-1">
							<div className="truncate font-medium text-label-sm text-text-strong-950">
								{inviteEmail}
							</div>
							<div className="mt-0.5 truncate text-text-sub-600 text-xs">
								{timeText ? `Invited ${timeText} • ` : ""}
								<span
									className={cn("font-medium", getRoleTextColor(inviteRole))}
								>
									{inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1)}{" "}
									role
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 px-5 pb-5 sm:px-6 sm:pb-6">
					<FancyButton.Root
						type="button"
						variant="basic"
						size="xsmall"
						onClick={() => onOpenChange(false)}
						disabled={isRevoking}
						className="justify-center"
					>
						Cancel
						<KbdEsc />
					</FancyButton.Root>
					<FancyButton.Root
						type="button"
						variant="destructive"
						size="xsmall"
						onClick={onConfirm}
						disabled={isRevoking}
					>
						<FancyButton.Icon as={Icon} name="trash-2" />
						{isRevoking ? (
							<>
								<Spinner size={14} color="currentColor" />
								Revoking...
							</>
						) : (
							"Revoke invite"
						)}
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
