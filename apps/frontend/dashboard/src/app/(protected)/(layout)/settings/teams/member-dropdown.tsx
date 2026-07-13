"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { useRef, useState } from "react";

export interface MemberDropdownProps {
	memberId: string;
	canChangeRole: boolean;
	onChangeRole: (id: string) => void;
	onRemove: (id: string) => void;
	onOpenChange?: (open: boolean) => void;
}

export const MemberDropdown = ({
	memberId,
	canChangeRole,
	onChangeRole,
	onRemove,
	onOpenChange,
}: MemberDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems = [
		...(canChangeRole
			? [
					{
						id: "change-role" as const,
						label: "Change role",
						icon: "user-role" as const,
						isDanger: false,
					},
				]
			: []),
		{
			id: "remove" as const,
			label: "Remove member",
			icon: "user-minus" as const,
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const handleItemClick = (itemId: string) => {
		if (itemId === "remove") {
			handleOpenChange(false);
			onRemove(memberId);
		} else if (itemId === "change-role") {
			handleOpenChange(false);
			onChangeRole(memberId);
		}
	};

	return (
		<Popover.Root open={popoverOpen} onOpenChange={handleOpenChange}>
			<Popover.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className="rounded p-1"
				>
					<Icon
						name="more-horizontal"
						className="h-3 w-3 text-text-sub-600 hover:text-text-strong-950"
					/>
				</Button.Root>
			</Popover.Trigger>
			<Popover.Content
				align="end"
				sideOffset={-8}
				className="w-40 rounded-xl p-1.5"
				showArrow
			>
				<div className="relative">
					{menuItems.map((item, idx) => (
						<button
							key={item.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => handleItemClick(item.id)}
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
								item.isDanger ? "text-error-base" : "text-text-strong-950",
								!currentRect &&
									hoverIdx === idx &&
									(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
							)}
						>
							<Icon
								name={item.icon}
								className={cn(
									"h-3.5 w-3.5",
									item.isDanger ? "" : "text-text-sub-600",
								)}
							/>
							<span>{item.label}</span>
						</button>
					))}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={isDanger}
					/>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};
