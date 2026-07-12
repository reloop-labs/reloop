"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useRef, useState } from "react";

export interface InviteDropdownProps {
	inviteId: string;
	onResendInvite: (id: string) => Promise<void>;
	onCopyInviteLink: (id: string) => void;
	onRevokeInvite: (id: string) => void;
	isResending: boolean;
}

const inviteMenuItems = [
	{
		id: "resend",
		label: "Resend invite",
		icon: "mail-single" as const,
		isDanger: false,
	},
	{
		id: "copy",
		label: "Copy invite link",
		icon: "link" as const,
		isDanger: false,
	},
	{
		id: "revoke",
		label: "Revoke invite",
		icon: "cross-circle" as const,
		isDanger: true,
	},
];

export const InviteDropdown = ({
	inviteId,
	onResendInvite,
	onCopyInviteLink,
	onRevokeInvite,
	isResending,
}: InviteDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = inviteMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = async (itemId: string) => {
		if (itemId === "revoke") {
			setDropdownOpen(false);
			onRevokeInvite(inviteId);
		} else if (itemId === "copy") {
			onCopyInviteLink(inviteId);
			setDropdownOpen(false);
		} else if (itemId === "resend") {
			await onResendInvite(inviteId);
			setDropdownOpen(false);
		}
	};

	return (
		<Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className="transition-transform duration-100 ease-out active:scale-[0.95]"
				>
					<Icon name="more-horizontal" className="h-3.5 w-3.5" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="end" className="w-40 p-1.5">
				<div className="relative">
					{inviteMenuItems.map((item, idx) => (
						<button
							key={item.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => handleItemClick(item.id)}
							disabled={item.id === "resend" && isResending}
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs transition-all duration-100 ease-out active:scale-[0.97]",
								item.isDanger ? "text-error-base" : "text-text-strong-950",
								!currentRect &&
									hoverIdx === idx &&
									(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								isResending &&
									item.id === "resend" &&
									"cursor-not-allowed opacity-50",
							)}
						>
							{item.id === "resend" && isResending ? (
								<Spinner size={14} color="var(--text-sub-600)" />
							) : (
								<Icon
									name={item.icon}
									className={cn(
										"h-3.5 w-3.5",
										item.isDanger ? "" : "text-text-sub-600",
									)}
								/>
							)}
							<span>{item.label}</span>
						</button>
					))}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={isDanger}
						className="rounded-[10px]"
					/>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
