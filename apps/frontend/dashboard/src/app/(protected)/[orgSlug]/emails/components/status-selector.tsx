"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type EmailStatus =
	| "delivered"
	| "sent"
	| "failed"
	| "bounced"
	| "pending"
	| "spam"
	| "opened"
	| "clicked";

interface StatusSelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
}

const statusOptions: {
	id: EmailStatus;
	label: string;
	colorClass: string;
}[] = [
	{ id: "delivered", label: "Delivered", colorClass: "bg-success-base" },
	{ id: "sent", label: "Sent", colorClass: "bg-success-base" },
	{ id: "opened", label: "Opened", colorClass: "bg-information-base" },
	{ id: "clicked", label: "Clicked", colorClass: "bg-information-base" },
	{ id: "pending", label: "Pending", colorClass: "bg-warning-base" },
	{ id: "failed", label: "Failed", colorClass: "bg-error-base" },
	{ id: "bounced", label: "Bounced", colorClass: "bg-error-base" },
	{ id: "spam", label: "Spam", colorClass: "bg-error-base" },
];

export const StatusSelector = ({ value, onChange }: StatusSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const hasActiveFilter = value.length > 0;

	const handleReset = () => {
		onChange([]);
		setIsOpen(false);
	};

	const handleToggle = (optionId: string | null) => {
		if (optionId === null) {
			onChange([]);
			setIsOpen(false);
			return;
		}

		if (value.includes(optionId)) {
			onChange(value.filter((v) => v !== optionId));
		} else {
			onChange([...value, optionId]);
		}
	};

	const displayLabel =
		value.length === 0
			? "Status"
			: value.length === 1
				? statusOptions.find((o) => o.id === value[0])?.label || "Status"
				: `${value.length} Statuses`;

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
				{/* Header */}
				<div className="flex items-center justify-between border-stroke-soft-200 border-b px-1 pb-2">
					<span className="font-medium text-text-sub-600 text-xs">
						Filter by status
					</span>
					{hasActiveFilter && (
						<button
							type="button"
							onClick={handleReset}
							className="rounded-lg border border-stroke-soft-200 px-2 py-1 text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50"
						>
							Reset
						</button>
					)}
				</div>

				<div className="relative mt-2">
					{/* All Statuses option */}
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
							!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
						)}
					>
						<div className="flex items-center gap-2">
							<div className="flex h-3 w-3 items-center justify-center">
								<div className="h-1.5 w-1.5 rounded-full border border-text-strong-950" />
							</div>
							<span className={cn(value.length === 0 && "font-medium")}>
								All Statuses
							</span>
						</div>
						{value.length === 0 && (
							<Icon name="check" className="h-3.5 w-3.5 text-text-strong-950" />
						)}
					</button>

					<div className="my-1 border-stroke-soft-200 border-t" />

					{statusOptions.map((option, idx) => {
						const isChecked = value.includes(option.id);
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
