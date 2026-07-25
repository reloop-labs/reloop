import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

export type StatusFilterOption = string | null;

interface StatusFilterDropdownProps {
	value: StatusFilterOption;
	onChange: (value: StatusFilterOption) => void;
}

const statusFilterOptions: {
	id: StatusFilterOption;
	label: string;
	icon: string;
	colorClass: string;
}[] = [
	{ id: null, label: "All Status", icon: "activity", colorClass: "" },
	{
		id: "200",
		label: "200 - Ok",
		icon: "check-circle",
		colorClass: "text-success-base",
	},
	{
		id: "201",
		label: "201 - Created",
		icon: "check-circle",
		colorClass: "text-success-base",
	},
	{
		id: "400",
		label: "400 - Bad Request",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
	{
		id: "403",
		label: "403 - Forbidden",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
	{
		id: "404",
		label: "404 - Not Found",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
	{
		id: "422",
		label: "422 - Unprocessable",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
	{
		id: "429",
		label: "429 - Too Many Requests",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
	{
		id: "500",
		label: "500 - Server Error",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
];

export const StatusFilterDropdown = ({
	value,
	onChange,
}: StatusFilterDropdownProps) => {
	const selectedOption =
		statusFilterOptions.find((o) => o.id === value) || statusFilterOptions[0];

	return (
		<Select
			value={value === null ? "all" : value}
			onValueChange={(val) => onChange(!val || val === "all" ? null : val)}
		>
			<SelectTrigger className="w-48">
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
			<SelectContent className="w-52">
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
};
