"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface Group {
	id: string;
	name: string;
}

export interface GroupDropdownProps {
	group: Group;
	onDelete: (group: Group) => void;
	isDeleting?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const GroupDropdown = ({
	group,
	onDelete,
	isDeleting = false,
	onOpenChange,
}: GroupDropdownProps) => {
	const router = useRouter();
	const { activeOrganization } = useUserOrganization();
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems = [
		{
			id: "view",
			label: "View Details",
			icon: "info-outline" as const,
			isDanger: false,
		},
		{
			id: "delete",
			label: "Delete group",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const handlePopoverOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = (itemId: string) => {
		if (itemId === "view") {
			setPopoverOpen(false);
			if (activeOrganization?.slug) {
				router.push(`/contacts/groups/${group.id}`);
			}
		} else if (itemId === "delete") {
			setPopoverOpen(false);
			onDelete(group);
		}
	};

	return (
		<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
			<PopoverTrigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					disabled={isDeleting}
				>
					<Icon name="more-horizontal" className="h-3 w-3" />
				</Button.Root>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={-10}
				className="w-40 rounded-xl p-1.5"
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
							disabled={item.id === "delete" && isDeleting}
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
								item.isDanger ? "text-error-base" : "text-text-strong-950",
								!currentRect &&
									hoverIdx === idx &&
									(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								isDeleting &&
									item.id === "delete" &&
									"cursor-not-allowed opacity-50",
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
			</PopoverContent>
		</PopoverRoot>
	);
};
