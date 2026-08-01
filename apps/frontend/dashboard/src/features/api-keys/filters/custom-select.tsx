import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type React from "react";
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

function OptionIcon({
	icon,
	colorClass,
}: {
	icon?: string | React.ReactNode;
	colorClass?: string;
}) {
	if (!icon) return null;
	if (typeof icon === "string") {
		return <Icon name={icon} className={cn("h-4 w-4 shrink-0", colorClass)} />;
	}
	return <>{icon}</>;
}

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
				{/* Leading icon must live inside SelectValue so alignItemWithTrigger
				    matches ItemText (icon + label) to Value (icon + label). */}
				<SelectValue placeholder={placeholder}>
					<OptionIcon
						icon={selectedOption?.icon}
						colorClass={selectedOption?.colorClass}
					/>
					<span className="min-w-0 truncate">
						{selectedOption?.label || placeholder}
					</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className={widthClass}>
				{options.map((option) => {
					const itemValue = option.id === null ? "__all__" : option.id;
					return (
						<SelectItem key={itemValue ?? "all"} value={itemValue}>
							<OptionIcon icon={option.icon} colorClass={option.colorClass} />
							<span className="min-w-0 truncate">{option.label}</span>
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
