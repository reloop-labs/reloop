
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import {
	getStatusColorClass,
	getStatusIcon,
} from "#/features/contacts/audience";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type ContactFilterOption = "subscribed" | "unsubscribed" | null;

interface ContactFilterDropdownProps {
	value: ContactFilterOption;
	onChange: (value: ContactFilterOption) => void;
}

const filterOptions: { id: ContactFilterOption; label: string }[] = [
	{ id: null, label: "All Status" },
	{ id: "subscribed", label: "Subscribed" },
	{ id: "unsubscribed", label: "Unsubscribed" },
];

export const ContactFilterDropdown = ({
	value,
	onChange,
}: ContactFilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const displayLabel =
		filterOptions.find((o) => o.id === value)?.label || "Status";

	const displayIcon = value ? getStatusIcon(value) : "activity";
	const displayIconColor = value ? getStatusColorClass(value) : "";

	const handleToggle = (optionId: ContactFilterOption) => {
		onChange(optionId);
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
						<Icon
							name={displayIcon}
							className={cn("h-3.5 w-3.5 shrink-0", displayIconColor)}
						/>
						<span className={cn("truncate", displayIconColor)}>
							{displayLabel}
						</span>
					</div>
					<Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-48 p-2">
				{/* Filter Options */}
				<div className="relative">
					{filterOptions.map((option, idx) => {
						const isChecked =
							option.id === null ? value === null : value === option.id;
						const optionColor = option.id ? getStatusColorClass(option.id) : "";
						return (
							<button
								key={option.id ?? "all"}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleToggle(option.id)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
									"text-text-strong-950",
									isChecked && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex items-center gap-2">
									{option.id ? (
										<Icon
											name={getStatusIcon(option.id)}
											className={cn("h-3.5 w-3.5", optionColor)}
										/>
									) : (
										<Icon name="activity" className="h-3.5 w-3.5" />
									)}
									<span className={cn(isChecked && "font-medium", optionColor)}>
										{option.label}
									</span>
								</div>
								{isChecked && (
									<Icon
										name="check"
										className="h-3.5 w-3.5 text-text-strong-950"
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
