import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import type { DomainStatus } from "../types";
import { getStatusColorClass, getStatusIcon } from "../utils";

export type DomainStatusFilterOption = DomainStatus | null;

const filterOptions: {
	id: DomainStatusFilterOption;
	label: string;
}[] = [
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
	const selectedOption =
		filterOptions.find((o) => o.id === value) || filterOptions[0];

	const displayIcon = selectedOption?.id
		? getStatusIcon(selectedOption.id)
		: "activity";

	const displayColorClass = selectedOption?.id
		? getStatusColorClass(selectedOption.id)
		: "";

	return (
		<Select
			value={value === null ? "all" : value}
			onValueChange={(val) =>
				onChange(val === "all" ? null : (val as DomainStatusFilterOption))
			}
		>
			<SelectTrigger className="w-40">
				<SelectValue placeholder="All Status">
					<Icon
						name={displayIcon}
						className={cn("h-4 w-4 shrink-0", displayColorClass)}
					/>
					<span className="min-w-0 truncate">{selectedOption?.label}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="w-40">
				{filterOptions.map((option) => {
					const icon = option.id ? getStatusIcon(option.id) : "activity";
					const colorClass = option.id ? getStatusColorClass(option.id) : "";
					return (
						<SelectItem key={option.id ?? "all"} value={option.id ?? "all"}>
							<Icon
								name={icon}
								className={cn("h-4 w-4 shrink-0", colorClass)}
							/>
							<span className="min-w-0 truncate">{option.label}</span>
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
