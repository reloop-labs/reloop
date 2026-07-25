import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";

export type TeamFilterOption = "invited" | "suspended" | "active";
export type TeamFilterValue = TeamFilterOption | "all";

interface TeamFilterDropdownProps {
	value: TeamFilterValue;
	onChange: (value: TeamFilterValue) => void;
}

const filterOptions: {
	id: TeamFilterValue;
	label: string;
	icon: string;
	colorClass: string;
}[] = [
	{ id: "all", label: "All Status", icon: "activity", colorClass: "" },
	{
		id: "active",
		label: "Active",
		icon: "check-circle",
		colorClass: "text-success-base",
	},
	{
		id: "suspended",
		label: "Suspended",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
	{
		id: "invited",
		label: "Invited",
		icon: "bell-plus",
		colorClass: "text-warning-base",
	},
];

export function TeamFilterDropdown({
	value,
	onChange,
}: TeamFilterDropdownProps) {
	const selectedOption =
		filterOptions.find((o) => o.id === value) || filterOptions[0];

	return (
		<Select
			value={value}
			onValueChange={(val) => onChange(val as TeamFilterValue)}
		>
			<SelectTrigger className="w-36">
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
			<SelectContent className="w-36">
				{filterOptions.map((option) => (
					<SelectItem key={option.id} value={option.id}>
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
