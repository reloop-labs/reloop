
import { Icon } from "@reloop/ui/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import {
	getStatusColorClass,
	getStatusIcon,
} from "#/features/contacts/audience";

export type ContactFilterOption = "subscribed" | "unsubscribed" | null;

interface ContactFilterDropdownProps {
	value: ContactFilterOption;
	onChange: (value: ContactFilterOption) => void;
}

const filterOptions: {
	id: ContactFilterOption;
	label: string;
}[] = [
	{ id: null, label: "All Status" },
	{ id: "subscribed", label: "Subscribed" },
	{ id: "unsubscribed", label: "Unsubscribed" },
];

export function ContactFilterDropdown({
	value,
	onChange,
}: ContactFilterDropdownProps) {
	const selectedOption =
		filterOptions.find((o) => o.id === value) || filterOptions[0];

	return (
		<Select
			value={value === null ? "all" : value}
			onValueChange={(val) =>
				onChange(val === "all" ? null : (val as ContactFilterOption))
			}
		>
			<SelectTrigger className="w-40">
				<SelectValue placeholder="All Status">
					{selectedOption?.id ? (
						<Icon
							name={getStatusIcon(selectedOption.id)}
							className={`h-4 w-4 shrink-0 ${getStatusColorClass(selectedOption.id)}`}
						/>
					) : (
						<Icon
							name="activity"
							className="h-4 w-4 shrink-0 text-text-sub-600"
						/>
					)}
					<span
						className={`min-w-0 truncate ${
							selectedOption?.id ? getStatusColorClass(selectedOption.id) : ""
						}`}
					>
						{selectedOption?.label}
					</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="w-40">
				{filterOptions.map((option) => (
					<SelectItem key={option.id ?? "all"} value={option.id ?? "all"}>
						{option.id ? (
							<Icon
								name={getStatusIcon(option.id)}
								className={`h-4 w-4 shrink-0 ${getStatusColorClass(option.id)}`}
							/>
						) : (
							<Icon
								name="activity"
								className="h-4 w-4 shrink-0 text-text-sub-600"
							/>
						)}
						<span
							className={`min-w-0 truncate ${
								option.id ? getStatusColorClass(option.id) : ""
							}`}
						>
							{option.label}
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
