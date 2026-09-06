"use client";

import { EditorFocusScope } from "@react-email/editor/ui";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { useState } from "react";
import { inspectorFieldClassName } from "./scrub-field";

export interface SelectOption {
	label: string;
	value: string;
}

export function SelectField({
	value,
	onChange,
	options,
	placeholder = "Select...",
}: {
	value: string;
	onChange: (v: string) => void;
	options: SelectOption[];
	placeholder?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const selected = options.find((opt) => opt.value === value);

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => setIsOpen((prev) => !prev)}
					className={cn(
						inspectorFieldClassName,
						"cursor-pointer justify-between text-left text-sm text-text-strong-950 font-normal outline-none select-none",
					)}
				>
					<span className="truncate">{selected?.label ?? placeholder}</span>
					<Icon
						name="chevron-down"
						className={cn(
							"size-3.5 shrink-0 text-text-sub-600 transition-transform duration-150",
							isOpen && "rotate-180",
						)}
					/>
				</button>
			</Popover.Trigger>
			<EditorFocusScope>
				<Popover.Content
					side="bottom"
					align="start"
					sideOffset={4}
					collisionPadding={8}
					showArrow={false}
					onOpenAutoFocus={(e) => e.preventDefault()}
					onCloseAutoFocus={(e) => e.preventDefault()}
					className="z-50 max-h-60 w-44 overflow-y-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-md dark:border-stroke-soft-100/40 dark:bg-black"
				>
					<div className="flex flex-col gap-0.5">
						{options.map((opt) => {
							const isSelected = opt.value === value;
							return (
								<button
									key={opt.value}
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => {
										onChange(opt.value);
										setIsOpen(false);
									}}
									className={cn(
										"flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
										isSelected
											? "bg-bg-soft-200 font-medium text-text-strong-950 dark:bg-bg-soft-200"
											: "text-text-sub-600 hover:bg-bg-soft-200/50 hover:text-text-strong-950",
									)}
								>
									<span className="truncate">{opt.label}</span>
									{isSelected && (
										<Icon name="check" className="size-3 text-primary-base" />
									)}
								</button>
							);
						})}
					</div>
				</Popover.Content>
			</EditorFocusScope>
		</Popover.Root>
	);
}
