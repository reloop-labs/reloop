import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";

export type PropertyFilterOption = "string" | "number" | null;
export type PropertyFilters = PropertyFilterOption;

interface PropertyFilterDropdownProps {
	value: PropertyFilters;
	onChange: (value: PropertyFilters) => void;
}

const filterOptions: {
	id: PropertyFilterOption;
	label: string;
	icon: string;
}[] = [
	{ id: null, label: "All types", icon: "activity" },
	{ id: "string", label: "String", icon: "text" },
	{ id: "number", label: "Number", icon: "hash" },
];

export function PropertyFilterDropdown({
	value,
	onChange,
}: PropertyFilterDropdownProps) {
	const selectedOption =
		filterOptions.find((o) => o.id === value) || filterOptions[0];

	return (
		<Select
			value={value === null ? "all" : value}
			onValueChange={(val) =>
				onChange(val === "all" ? null : (val as PropertyFilterOption))
			}
		>
			<SelectTrigger className="w-40">
				<SelectValue placeholder="All types">
					{selectedOption?.icon ? (
						<Icon
							name={selectedOption.icon}
							className="h-4 w-4 shrink-0 text-text-sub-600"
						/>
					) : null}
					<span className="min-w-0 truncate">{selectedOption?.label}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="w-40">
				{filterOptions.map((option) => (
					<SelectItem key={option.id ?? "all"} value={option.id ?? "all"}>
						<Icon
							name={option.icon}
							className="h-4 w-4 shrink-0 text-text-sub-600"
						/>
						<span className="min-w-0 truncate">{option.label}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
