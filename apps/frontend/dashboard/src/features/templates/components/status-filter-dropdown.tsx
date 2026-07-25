import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { Template } from "#/features/templates/hooks/use-templates-query";

export type TemplateStatusFilter = Template["status"] | null;

const statusOptions: {
	id: TemplateStatusFilter;
	label: string;
	icon: string;
	colorClass: string;
}[] = [
	{ id: null, label: "All Status", icon: "activity", colorClass: "" },
	{
		id: "draft",
		label: "Draft",
		icon: "clock",
		colorClass: "text-warning-base",
	},
	{
		id: "published",
		label: "Published",
		icon: "check-circle",
		colorClass: "text-success-base",
	},
	{
		id: "archived",
		label: "Archived",
		icon: "cross-circle",
		colorClass: "text-text-sub-600",
	},
];

export function TemplateStatusFilterDropdown({
	value,
	onChange,
}: {
	value: TemplateStatusFilter;
	onChange: (value: TemplateStatusFilter) => void;
}) {
	const selectedOption =
		statusOptions.find((o) => o.id === value) || statusOptions[0];

	return (
		<Select
			value={value === null ? "all" : value}
			onValueChange={(val) =>
				onChange(!val || val === "all" ? null : (val as Template["status"]))
			}
		>
			<SelectTrigger className="w-40">
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
				{statusOptions.map((option) => (
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
