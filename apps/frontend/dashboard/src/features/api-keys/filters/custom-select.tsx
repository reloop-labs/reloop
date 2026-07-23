import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./base-ui-select";

export type CustomSelectOption<T extends string | null = string | null> = {
	id: T;
	label: string;
	icon?: string | React.ReactNode;
	colorClass?: string;
};

export function CustomSelect<T extends string | null>({
	value,
	onChange,
	options,
	widthClass = "w-40",
	placeholder = "Select...",
}: {
	value: T;
	onChange: (value: T) => void;
	options: CustomSelectOption<T>[];
	widthClass?: string;
	placeholder?: string;
}) {
	// Map nullable string values to non-null strings for SelectPrimitive
	const stringValue = value === null ? "__all__" : (value as string);

	const handleValueChange = (newVal: any) => {
		if (newVal === "__all__") {
			onChange(null as T);
		} else {
			onChange(newVal as T);
		}
	};

	const selectedOption = options.find((o) => o.id === value) || options[0];

	return (
		<Select value={stringValue} onValueChange={handleValueChange}>
			<SelectTrigger className={cn("h-9", widthClass)}>
				<div className="flex items-center gap-2 overflow-hidden min-w-0">
					{selectedOption?.icon &&
						(typeof selectedOption.icon === "string" ? (
							<Icon
								name={selectedOption.icon}
								className={cn("h-4 w-4 shrink-0", selectedOption.colorClass)}
							/>
						) : (
							selectedOption.icon
						))}
					<SelectValue placeholder={placeholder}>
						{selectedOption?.label || placeholder}
					</SelectValue>
				</div>
			</SelectTrigger>
			<SelectContent alignItemWithTrigger={true} className={widthClass}>
				{options.map((option) => {
					const itemValue = option.id === null ? "__all__" : option.id;
					return (
						<SelectItem key={itemValue ?? "all"} value={itemValue}>
							<div className="flex items-center gap-2 min-w-0 flex-1">
								{option.icon &&
									(typeof option.icon === "string" ? (
										<Icon
											name={option.icon}
											className={cn("h-4 w-4 shrink-0", option.colorClass)}
										/>
									) : (
										option.icon
									))}
								<span className="truncate">{option.label}</span>
							</div>
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
