import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export interface InviteDropdownProps {
	inviteId: string;
	onResendInvite: (id: string) => Promise<void>;
	/** Omit for expired invites — the link is no longer usable. */
	onCopyInviteLink?: (id: string) => void;
	onRevokeInvite: (id: string) => void;
	isResending: boolean;
	onOpenChange?: (open: boolean) => void;
}

const inviteMenuItems = [
	{
		id: "resend" as const,
		label: "Resend invite",
		icon: "mail-single" as const,
		isDanger: false,
	},
	{
		id: "copy" as const,
		label: "Copy invite link",
		icon: "link" as const,
		isDanger: false,
	},
	{
		id: "revoke" as const,
		label: "Revoke invite",
		icon: "cross-circle" as const,
		isDanger: true,
	},
] as const;

export const InviteDropdown = ({
	inviteId,
	onResendInvite,
	onCopyInviteLink,
	onRevokeInvite,
	isResending,
	onOpenChange,
}: InviteDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [open, setOpen] = useState(false);
	const [isResendCompleted, setIsResendCompleted] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const visibleItems = inviteMenuItems.filter(
		(item) => item.id !== "copy" || Boolean(onCopyInviteLink),
	);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = visibleItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setHoverIdx(undefined);
			setIsResendCompleted(false);
			setIsCopied(false);
		}
		onOpenChange?.(nextOpen);
	};

	const handleItemClick = async (itemId: string) => {
		if (itemId === "revoke") {
			handleOpenChange(false);
			onRevokeInvite(inviteId);
		} else if (itemId === "copy") {
			onCopyInviteLink?.(inviteId);
			setIsCopied(true);
			setTimeout(() => {
				setIsCopied(false);
				handleOpenChange(false);
			}, 900);
		} else if (itemId === "resend") {
			try {
				await onResendInvite(inviteId);
				setIsResendCompleted(true);
				setTimeout(() => {
					setIsResendCompleted(false);
					handleOpenChange(false);
				}, 750);
			} catch {
				handleOpenChange(false);
			}
		}
	};

	return (
		<div
			className="flex items-center justify-end"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Dropdown.Root open={open} onOpenChange={handleOpenChange}>
				<Dropdown.Trigger asChild>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="aspect-square h-7 w-7 rounded-lg p-0"
						aria-label="Actions for invitation"
					>
						<Icon
							name="more-horizontal"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content
					align="end"
					sideOffset={6}
					className="w-44 gap-0 rounded-xl p-1.5"
				>
					<div className="relative">
						{visibleItems.map((item, idx) => {
							const isResendItem = item.id === "resend";
							const isCopyItem = item.id === "copy";
							const resendStateKey = isResendCompleted
								? "completed"
								: isResending
									? "loading"
									: "idle";

							return (
								<button
									key={item.id}
									ref={(el) => {
										if (el) buttonRefs.current[idx] = el;
									}}
									type="button"
									onPointerEnter={() => setHoverIdx(idx)}
									onPointerLeave={() => setHoverIdx(undefined)}
									onClick={() => handleItemClick(item.id)}
									disabled={
										(isResendItem && (isResending || isResendCompleted)) ||
										(isCopyItem && isCopied)
									}
									className={cn(
										"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
										item.isDanger ? "text-error-base" : "text-text-strong-950",
										!currentRect &&
											hoverIdx === idx &&
											(item.isDanger
												? "bg-red-alpha-10"
												: "bg-neutral-alpha-10"),
										isResendItem &&
											(isResending || isResendCompleted) &&
											"cursor-not-allowed opacity-90",
									)}
								>
									{isResendItem ? (
										<AnimatePresence mode="popLayout" initial={false}>
											<motion.div
												key={resendStateKey}
												transition={{
													type: "spring",
													duration: 0.25,
													bounce: 0,
												}}
												initial={{ opacity: 0, y: -14 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 14 }}
												className="flex items-center gap-2"
											>
												{isResendCompleted ? (
													<>
														<Icon
															name="check-circle"
															className="h-3.5 w-3.5 shrink-0 text-success-base"
														/>
														<span className="text-success-base">
															Resent invite!
														</span>
													</>
												) : isResending ? (
													<>
														<Icon
															name="loader-2"
															className="h-3.5 w-3.5 shrink-0 animate-spin text-text-sub-600"
														/>
														<span>Resending...</span>
													</>
												) : (
													<>
														<Icon
															name={item.icon}
															className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
														/>
														<span>{item.label}</span>
													</>
												)}
											</motion.div>
										</AnimatePresence>
									) : isCopyItem ? (
										<AnimatePresence mode="popLayout" initial={false}>
											<motion.div
												key={isCopied ? "copied" : "idle"}
												transition={{
													type: "spring",
													duration: 0.25,
													bounce: 0,
												}}
												initial={{ opacity: 0, y: -14 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 14 }}
												className="flex items-center gap-2"
											>
												<Icon
													name={isCopied ? "check-circle" : item.icon}
													className={cn(
														"h-3.5 w-3.5 shrink-0",
														isCopied
															? "text-success-base"
															: "text-text-sub-600",
													)}
												/>
												<span className={isCopied ? "text-success-base" : ""}>
													{isCopied ? "Copied link!" : item.label}
												</span>
											</motion.div>
										</AnimatePresence>
									) : (
										<>
											<Icon
												name={item.icon}
												className={cn(
													"h-3.5 w-3.5 shrink-0",
													item.isDanger ? "" : "text-text-sub-600",
												)}
											/>
											<span>{item.label}</span>
										</>
									)}
								</button>
							);
						})}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
};
