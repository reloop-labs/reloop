import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./base-ui-select";

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
	const selectedOption =
		statusFilterOptions.find((o) => o.id === value) || statusFilterOptions[0];

	return (
		<Select
			value={value === null ? "all" : value}
			onValueChange={(val) =>
				onChange(val === "all" ? null : (val as ApiKeyStatusFilterOption))
			}
		>
			<SelectTrigger className="w-40">
				{/* Leading icon must live inside SelectValue so alignItemWithTrigger
				    matches ItemText (icon + label) to Value (icon + label). */}
				<SelectValue placeholder="All Status">
					{selectedOption?.icon ? (
						<Icon
							name={selectedOption.icon}
							className={cn("h-4 w-4 shrink-0", selectedOption.colorClass)}
						/>
					) : null}
					<span className="min-w-0 truncate">{selectedOption?.label}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="w-40">
				{statusFilterOptions.map((option) => (
					<SelectItem key={option.id ?? "all"} value={option.id ?? "all"}>
						<Icon
							name={option.icon}
							className={cn("h-4 w-4 shrink-0", option.colorClass)}
						/>
						<span className="min-w-0 truncate">{option.label}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
