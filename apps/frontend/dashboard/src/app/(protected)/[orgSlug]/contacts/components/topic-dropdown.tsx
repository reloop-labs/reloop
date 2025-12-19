"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { useRef, useState } from "react";

interface TopicDropdownProps {
	topicId: string;
	topicName: string;
	onViewDetails: (id: string) => void;
	onDelete: (id: string) => void;
	onOpenChange?: (open: boolean) => void;
}

export const TopicDropdown = ({
	topicId,
	topicName,
	onViewDetails,
	onDelete,
	onOpenChange,
}: TopicDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const handleViewDetails = () => {
		onViewDetails(topicId);
		setPopoverOpen(false);
	};

	const handleDelete = () => {
		onDelete(topicId);
		setPopoverOpen(false);
	};

	const menuItems = [
		{
			icon: "eye-outline" as const,
			label: "View Details",
			onClick: handleViewDetails,
		},
		{
			icon: "trash" as const,
			label: "Delete",
			onClick: handleDelete,
			className: "text-error-base",
		},
	];

	return (
		<PopoverRoot open={popoverOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-bg-weak-50"
				>
					<Icon name="more-vertical" className="h-3 w-3 text-text-sub-600" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-40 rounded-xl p-1.5"
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
								"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-text-strong-950 text-xs transition-colors",
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
