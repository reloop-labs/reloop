import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export type ApiKeyStatusFilterOption = "enabled" | "disabled" | null;

const statusFilterOptions: {
	id: ApiKeyStatusFilterOption;
	label: string;
	icon: string;
	colorClass: string;
}[] = [
	{ id: null, label: "All Status", icon: "activity", colorClass: "" },
	{
		id: "enabled",
		label: "Enabled",
		icon: "check-circle",
		colorClass: "text-success-base",
	},
	{
		id: "disabled",
		label: "Disabled",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
];

export function ApiKeyStatusFilterDropdown({
	value,
	onChange,
}: {
	value: ApiKeyStatusFilterOption;
	onChange: (value: ApiKeyStatusFilterOption) => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const currentTab =
		hoverIdx !== undefined ? buttonRefs.current[hoverIdx] : undefined;
	const currentRect = currentTab?.getBoundingClientRect();

	const selectedOption =
		statusFilterOptions.find((o) => o.id === value) || statusFilterOptions[0];

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className="w-36 justify-between gap-1.5 whitespace-nowrap rounded-[10px]"
				>
					<div className="flex items-center gap-1.5 overflow-hidden">
						<Icon
							name={selectedOption?.icon ?? "activity"}
							className={cn(
								"h-3.5 w-3.5 shrink-0",
								selectedOption?.colorClass,
							)}
						/>
						<span className="truncate">
							{selectedOption?.label || "All Status"}
						</span>
					</div>
					<Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-36 p-2">
				<div className="relative">
					{statusFilterOptions.map((option, idx) => {
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
									<Icon
										name={option.icon}
										className={cn("h-3.5 w-3.5", option.colorClass)}
									/>
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
