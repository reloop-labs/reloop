
import {
	getAvatarGradient,
	getAvatarInitial,
} from "#/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import {
	AnimatePresence,
	animate,
	motion,
	useMotionValue,
	type AnimationPlaybackControls,
} from "motion/react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface RevokeInviteModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void> | void;
	isRevoking: boolean;
	inviteEmail: string;
	inviteRole?: string;
	invitedAt?: Date | string;
}

export const RevokeInviteModal = ({
	open,
	onOpenChange,
	onConfirm,
	isRevoking: _isRevoking,
	inviteEmail,
	inviteRole = "member",
	invitedAt,
}: RevokeInviteModalProps) => {
	const [status, setStatus] = useState<"idle" | "revoking" | "success">("idle");
	const [isHolding, setIsHolding] = useState(false);
	const holdProgress = useMotionValue(0);
	const animationRef = useRef<AnimationPlaybackControls | null>(null);

	const handleRevoke = async () => {
		if (status !== "idle") return;
		setStatus("revoking");
		try {
			await onConfirm();
			setStatus("success");
			setTimeout(() => {
				onOpenChange(false);
				setTimeout(() => {
					setStatus("idle");
				}, 300);
			}, 1000);
		} catch {
			setStatus("idle");
		}
	};

	const startHold = () => {
		if (status !== "idle") return;
		setIsHolding(true);
		holdProgress.set(0);
		animationRef.current = animate(holdProgress, 1, {
			duration: 1.2,
			ease: "linear",
			onComplete: () => {
				setIsHolding(false);
				holdProgress.set(0);
				void handleRevoke();
			},
		});
	};

	const cancelHold = () => {
		if (!isHolding && holdProgress.get() === 0) return;
		setIsHolding(false);
		animationRef.current?.stop();
		animate(holdProgress, 0, {
			duration: 0.2,
			ease: "easeOut",
		});
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && status === "idle") {
				void handleRevoke();
			}
		},
		{ enabled: open },
	);

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
		<Modal.Root
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					cancelHold();
				}
				onOpenChange(nextOpen);
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				{/* Header */}
				<div className="relative pr-6">
					<Modal.Title className="font-semibold text-lg text-text-strong-950">
						Revoke invite
					</Modal.Title>
					<Modal.Description className="mt-1 text-paragraph-sm text-text-sub-600">
						Are you sure you want to revoke this invitation? This action cannot be
						undone.
					</Modal.Description>
				</div>

				{/* Invite Details Card */}
				<div className="mt-5 flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-3.5 dark:border-stroke-soft-100/40">
					<Avatar.Root size="32" color="gray" className="flex-shrink-0">
						<Avatar.Image asChild>
							<div
								className={cn(
									"flex h-8 w-8 items-center justify-center rounded-full font-semibold text-[11px] text-white uppercase tracking-wide shadow-xs",
									getAvatarGradient(inviteEmail),
								)}
							>
								{getAvatarInitial(null, inviteEmail)}
							</div>
						</Avatar.Image>
					</Avatar.Root>
					<div className="min-w-0 flex-1">
						<div className="truncate font-medium text-paragraph-sm text-text-strong-950">
							{inviteEmail}
						</div>
						<div className="mt-0.5 truncate text-text-sub-600 text-xs">
							{timeText ? `Invited ${timeText} • ` : ""}
							<span className={cn("font-medium", getRoleTextColor(inviteRole))}>
								{inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1)} role
							</span>
						</div>
					</div>
				</div>

				{/* Warning Banner */}
				<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-3.5 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
					<span className="font-semibold">Warning:</span> The recipient won't be
					able to use the link to join, and you'll need to send a new invite if
					you change your mind.
				</div>

				{/* Footer */}
				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={() => {
							if (status === "idle") {
								cancelHold();
								onOpenChange(false);
							}
						}}
						disabled={status !== "idle"}
						className={cn(
							"transition-opacity duration-200",
							status !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
					</Button.Root>
					<FancyButton.Root
						type="button"
						variant={status === "success" ? "success" : "destructive"}
						size="small"
						onPointerDown={startHold}
						onPointerUp={cancelHold}
						onPointerLeave={cancelHold}
						onPointerCancel={cancelHold}
						className={cn(
							"relative min-w-[134px] select-none justify-center overflow-hidden transition-all duration-200 font-medium",
							status === "revoking" && "pointer-events-none opacity-90",
						)}
						disabled={status === "revoking"}
					>
						{/* Hold progress overlay fill */}
						{status === "idle" && (
							<motion.div
								className="pointer-events-none absolute inset-0 bg-white/25 origin-left"
								style={{ scaleX: holdProgress }}
							/>
						)}

						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={status}
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="relative z-10 flex items-center justify-center gap-1.5 font-medium"
							>
								{status === "revoking" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Revoking...</span>
									</>
								) : status === "success" ? (
									<>
										<Icon
											name="check-circle"
											className="h-4 w-4 shrink-0 text-white"
										/>
										<span>Revoked</span>
									</>
								) : (
									<span>Hold to revoke</span>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
