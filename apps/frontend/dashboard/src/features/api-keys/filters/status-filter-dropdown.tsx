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
				<div className="flex min-w-0 items-center gap-2 overflow-hidden">
					{selectedOption?.icon && (
						<Icon
							name={selectedOption.icon}
							className={cn("h-4 w-4 shrink-0", selectedOption.colorClass)}
						/>
					)}
					<SelectValue placeholder="All Status">
						{selectedOption?.label}
					</SelectValue>
				</div>
			</SelectTrigger>
			<SelectContent
				alignItemWithTrigger={true}
				alignOffset={-14}
				className="w-40"
			>
				{statusFilterOptions.map((option) => (
					<SelectItem key={option.id ?? "all"} value={option.id ?? "all"}>
						<div className="flex min-w-0 items-center gap-2">
							<Icon
								name={option.icon}
								className={cn("h-4 w-4 shrink-0", option.colorClass)}
							/>
							<span className="truncate">{option.label}</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
