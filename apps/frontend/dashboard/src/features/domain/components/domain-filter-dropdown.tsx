import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import type { DomainStatus } from "../types";
import { getStatusColorClass, getStatusIcon } from "../utils";

export type DomainStatusFilterOption = DomainStatus | null;

const filterOptions: { id: DomainStatusFilterOption; label: string }[] = [
	{ id: null, label: "All Status" },
	{ id: "pending", label: "Not Started" },
	{ id: "verifying", label: "Verifying" },
	{ id: "active", label: "Active" },
	{ id: "suspended", label: "Suspended" },
	{ id: "failed", label: "Failed" },
];

export function DomainFilterDropdown({
	value,
	onChange,
}: {
	value: DomainStatusFilterOption;
	onChange: (value: DomainStatusFilterOption) => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const selectedIdx = filterOptions.findIndex((o) => o.id === value);
	const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;
	const currentTab = buttonRefs.current[activeIdx];
	const currentRect = currentTab?.getBoundingClientRect();

	const selectedOption = value
		? filterOptions.find((o) => o.id === value)
		: null;
	const displayLabel = selectedOption ? selectedOption.label : "All Status";
	const displayIcon = selectedOption?.id
		? getStatusIcon(selectedOption.id)
		: "activity";

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className="w-40 justify-between gap-1.5 whitespace-nowrap rounded-[10px]"
				>
					<div className="flex items-center gap-1.5 overflow-hidden">
						<Icon
							name={displayIcon}
							className={cn(
								"h-3.5 w-3.5 shrink-0",
								selectedOption?.id
									? getStatusColorClass(selectedOption.id)
									: "",
							)}
						/>
						<span className="truncate">{displayLabel}</span>
					</div>
					<Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-40 p-2">
				<div className="relative">
					{filterOptions.map((option, idx) => {
						const isChecked = value === option.id;
						return (
							<button
								key={option.id ?? "all"}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => {
									onChange(option.id);
									setIsOpen(false);
								}}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-xs text-text-strong-950",
									isChecked && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex items-center gap-2">
									{option.id ? (
										<Icon
											name={getStatusIcon(option.id)}
											className={cn(
												"h-3.5 w-3.5",
												getStatusColorClass(option.id),
											)}
										/>
									) : (
										<Icon name="activity" className="h-3.5 w-3.5" />
									)}
									<span className={cn(isChecked && "font-medium")}>
										{option.label}
									</span>
								</div>
								{isChecked && <Icon name="check" className="h-3.5 w-3.5" />}
							</button>
						);
					})}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
