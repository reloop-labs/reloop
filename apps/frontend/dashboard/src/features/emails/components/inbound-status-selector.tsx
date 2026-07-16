import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type InboundEmailStatus =
	| "received"
	| "processing"
	| "delivered"
	| "spam"
	| "rejected"
	| "failed";

interface InboundStatusSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

const statusOptions: {
	id: InboundEmailStatus;
	label: string;
	colorClass: string;
}[] = [
	{ id: "received", label: "Received", colorClass: "bg-success-base" },
	{ id: "delivered", label: "Delivered", colorClass: "bg-success-base" },
	{ id: "processing", label: "Processing", colorClass: "bg-warning-base" },
	{ id: "spam", label: "Spam", colorClass: "bg-error-base" },
	{ id: "rejected", label: "Rejected", colorClass: "bg-error-base" },
	{ id: "failed", label: "Failed", colorClass: "bg-error-base" },
];

export const InboundStatusSelector = ({
	value,
	onChange,
}: InboundStatusSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hasActiveFilter = !!value;

	const handleToggle = (optionId: string | null) => {
		if (optionId === null) {
			onChange("");
			setIsOpen(false);
			return;
		}
		onChange(optionId === value ? "" : optionId);
		setIsOpen(false);
	};

	const displayLabel =
		value === ""
			? "Status"
			: statusOptions.find((o) => o.id === value)?.label || "Status";

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className={cn(
						"gap-1.5 whitespace-nowrap rounded-xl",
						hasActiveFilter &&
							"border-stroke-soft-900 bg-neutral-alpha-10 text-text-strong-950",
					)}
				>
					<Button.Icon>
						<Icon name="check-circle" className="h-3.5 w-3.5" />
					</Button.Icon>
					{displayLabel}
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-56 p-2">
				<div className="relative max-h-80 overflow-y-auto">
					<button
						ref={(el) => {
							if (el) buttonRefs.current[0] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(0)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={() => handleToggle(null)}
						className={cn(
							"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
							"text-text-strong-950",
							value === "" && "bg-neutral-alpha-10",
							!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
						)}
					>
						<div className="flex items-center gap-2">
							<div className="flex h-3 w-3 items-center justify-center">
								<div className="h-1.5 w-1.5 rounded-full border border-text-strong-950" />
							</div>
							<span className={cn(value === "" && "font-medium")}>
								All Status
							</span>
						</div>
						{value === "" && (
							<Icon name="check" className="h-3.5 w-3.5 text-text-strong-950" />
						)}
					</button>
					{statusOptions.map((option, idx) => {
						const isChecked = value === option.id;
						const index = idx + 1;
						return (
							<button
								key={option.id}
								ref={(el) => {
									if (el) buttonRefs.current[index] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(index)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleToggle(option.id)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
									"text-text-strong-950",
									isChecked && "bg-neutral-alpha-10",
									!currentRect && hoverIdx === index && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex items-center gap-2">
									<div className="flex h-3 w-3 items-center justify-center">
										<div
											className={cn(
												"h-1.5 w-1.5 rounded-full",
												option.colorClass,
											)}
										/>
									</div>
									<span className={cn(isChecked && "font-medium")}>
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
