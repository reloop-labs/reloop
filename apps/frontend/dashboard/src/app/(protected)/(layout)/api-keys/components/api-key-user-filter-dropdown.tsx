"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export interface CreatedByUser {
	id: string;
	name: string | null;
	image: string | null;
}

interface ApiKeyUserFilterDropdownProps {
	value: string | null;
	onChange: (value: string | null) => void;
	availableCreators: CreatedByUser[];
}

export const ApiKeyUserFilterDropdown = ({
	value,
	onChange,
	availableCreators,
}: ApiKeyUserFilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const activeIdx = hoverIdx;

	const currentTab =
		activeIdx !== undefined ? buttonRefs.current[activeIdx] : undefined;
	const currentRect = currentTab?.getBoundingClientRect();

	const selectedCreator = availableCreators.find((c) => c.id === value);

	const displayLabel = selectedCreator
		? selectedCreator.name || "Unknown"
		: "All Users";

	const handleToggle = (userId: string | null) => {
		onChange(userId);
		setIsOpen(false);
	};

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className="w-48 justify-between gap-1.5 whitespace-nowrap rounded-[10px]"
				>
					<div className="flex items-center gap-1.5 overflow-hidden">
						{selectedCreator ? (
							<Avatar.Root size="16">
								{selectedCreator.image ? (
									<Avatar.Image
										src={selectedCreator.image}
										alt={selectedCreator.name || "User"}
									/>
								) : null}
							</Avatar.Root>
						) : (
							<Icon name="user" className="h-3.5 w-3.5 shrink-0" />
						)}
						<span className="truncate">{displayLabel}</span>
					</div>
					<Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-48 p-2">
				<div className="relative">
					<button
						ref={(el) => {
							if (el) buttonRefs.current[0] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(0)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={() => handleToggle(null)}
						className={cn(
							"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
							"text-text-strong-950",
							value === null && "bg-neutral-alpha-10",
						)}
					>
						<div className="flex items-center gap-2">
							<Icon name="user" className="h-3.5 w-3.5" />
							<span
								className={cn(
									value === null && "font-medium text-text-strong-950",
								)}
							>
								All Users
							</span>
						</div>
						{value === null && (
							<Icon name="check" className="h-3.5 w-3.5 text-text-strong-950" />
						)}
					</button>

					{availableCreators.map((creator, idx) => {
						const isChecked = value === creator.id;
						const itemIdx = idx + 1;
						return (
							<button
								key={creator.id}
								ref={(el) => {
									if (el) buttonRefs.current[itemIdx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(itemIdx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleToggle(creator.id)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
									"text-text-strong-950",
									isChecked && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex min-w-0 items-center gap-2">
									<Avatar.Root size="16">
										{creator.image ? (
											<Avatar.Image
												src={creator.image}
												alt={creator.name || "User"}
											/>
										) : null}
									</Avatar.Root>
									<span
										className={cn(
											"truncate",
											isChecked && "font-medium text-text-strong-950",
										)}
									>
										{creator.name || "Unknown"}
									</span>
								</div>
								{isChecked && (
									<Icon
										name="check"
										className="h-3.5 w-3.5 shrink-0 text-text-strong-950"
									/>
								)}
							</button>
						);
					})}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
