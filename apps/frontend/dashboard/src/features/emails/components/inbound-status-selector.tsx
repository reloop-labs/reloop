import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";

export type InboundEmailStatus =
	| "received"
	| "processing"
	| "delivered"
	| "spam"
	| "rejected"
	| "failed";

interface InboundStatusSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

const statusOptions: {
	id: InboundEmailStatus | null;
	label: string;
	icon: string;
	colorClass: string;
}[] = [
	{ id: null, label: "All Status", icon: "activity", colorClass: "" },
	{
		id: "received",
		label: "Received",
		icon: "check-circle",
		colorClass: "text-success-base",
	},
	{
		id: "delivered",
		label: "Delivered",
		icon: "check-circle",
		colorClass: "text-success-base",
	},
	{
		id: "processing",
		label: "Processing",
		icon: "clock",
		colorClass: "text-warning-base",
	},
	{
		id: "spam",
		label: "Spam",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
	{
		id: "rejected",
		label: "Rejected",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
	{
		id: "failed",
		label: "Failed",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
];

export const InboundStatusSelector = ({
	value,
	onChange,
}: InboundStatusSelectorProps) => {
	const selectedOption =
		statusOptions.find((o) => o.id === (value || null)) || statusOptions[0];

	return (
		<Select
			value={value === "" ? "all" : value}
			onValueChange={(val) => onChange(!val || val === "all" ? "" : val)}
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
};
