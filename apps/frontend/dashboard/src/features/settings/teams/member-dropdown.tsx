import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

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
	const [open, setOpen] = useState(false);
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

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) setHoverIdx(undefined);
		onOpenChange?.(nextOpen);
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
						aria-label="Actions for team member"
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
									"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								)}
							>
								<Icon
									name={item.icon}
									className={cn(
										"h-3.5 w-3.5 shrink-0",
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
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
};
