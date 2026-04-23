"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

interface PageSizeDropdownProps {
	value: number;
	onValueChange: (value: number) => void;
	options?: number[];
}

const defaultOptions = [10, 20, 50, 100];

export const PageSizeDropdown = ({
	value,
	onValueChange,
	options = defaultOptions,
}: PageSizeDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	// Use hoverIdx if hovering, otherwise use the selected item's index
	const selectedIdx = options.findIndex((size) => size === value);
	const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;

	const currentTab = buttonRefs.current[activeIdx];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleItemClick = (size: number) => {
		onValueChange(size);
		setDropdownOpen(false);
	};

	return (
		<Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
			<Dropdown.Trigger asChild>
				<button
					type="button"
					className={cn(
						"flex items-center gap-1 rounded-md px-1.5 py-0.5 text-label-xs text-text-sub-600 uppercase outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-base",
						hoverIdx !== undefined || dropdownOpen
							? "bg-bg-weak-50 text-text-strong-950"
							: "hover:bg-bg-weak-50 hover:text-text-strong-950",
					)}
				>
					{value}
					<Icon
						name="chevron-down"
						className={cn(
							"h-3 w-3 transition-transform duration-200",
							dropdownOpen && "rotate-180",
						)}
					/>
				</button>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-20 rounded-xl p-1.5">
				<div className="relative">
					{options.map((size, idx) => (
						<button
							key={size}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => handleItemClick(size)}
							className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-text-strong-950 text-xs transition-colors"
						>
							{size}
							{value === size && (
								<Icon name="check-circle" className="h-3 w-3" />
							)}
						</button>
					))}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
