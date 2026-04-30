"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { useRef, useState } from "react";

interface ChannelDropdownProps {
	channelId: string;
	channelName: string;
	visibility?: "private" | "public";
	onDelete: (id: string) => void;
	onToggleVisibility?: (id: string, currentValue: "private" | "public") => void;
	onOpenChange?: (open: boolean) => void;
}

export const ChannelDropdown = ({
	channelId,
	channelName: _channelName,
	visibility = "private",
	onDelete,
	onToggleVisibility,
	onOpenChange,
}: ChannelDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const handleDelete = () => {
		onDelete(channelId);
		setPopoverOpen(false);
	};

	const handleToggleVisibility = () => {
		onToggleVisibility?.(channelId, visibility);
		setPopoverOpen(false);
	};

	const visibilityIcon = visibility === "public" ? "lock" : "globe";

	const menuItems = [
		{
			icon: visibilityIcon as "lock" | "globe",
			label: visibility === "public" ? "Set Private" : "Set Public",
			onClick: handleToggleVisibility,
			hidden: !onToggleVisibility,
		},
		{
			icon: "trash" as const,
			label: "Delete Channel",
			onClick: handleDelete,
			className: "text-error-base",
		},
	].filter((item) => !item.hidden);

	return (
		<PopoverRoot open={popoverOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button.Root variant="neutral" mode="ghost" size="xxsmall">
					<Icon name="more-horizontal" className="h-3 w-3" />
				</Button.Root>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-44 rounded-xl p-1.5"
				sideOffset={-6}
			>
				<div className="relative">
					{menuItems.map((item, idx) => (
						<button
							key={item.label}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={item.onClick}
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-text-strong-950 text-xs transition-colors",
								!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
								item.className,
							)}
						>
							<Icon name={item.icon} className="h-3.5 w-3.5" />
							{item.label}
						</button>
					))}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</PopoverContent>
		</PopoverRoot>
	);
};
