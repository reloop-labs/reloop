import { cn } from "@reloop/ui/cn";
import { emailStatusTone } from "@reloop/ui/email-status";
import { Icon } from "@reloop/ui/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";

export type EmailStatus =
	| "delivered"
	| "sent"
	| "failed"
	| "bounced"
	| "pending"
	| "spam"
	| "opened"
	| "clicked";

interface StatusSelectorProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

const statusOptions: {
	id: EmailStatus | null;
	label: string;
	icon: string;
	colorClass: string;
}[] = [
	{ id: null, label: "All Status", icon: "activity", colorClass: "" },
	{
		id: "delivered",
		label: "Delivered",
		icon: emailStatusTone("delivered").icon,
		colorClass: emailStatusTone("delivered").text,
	},
	{
		id: "sent",
		label: "Sent",
		icon: emailStatusTone("sent").icon,
		colorClass: emailStatusTone("sent").text,
	},
	{
		id: "opened",
		label: "Opened",
		icon: emailStatusTone("opened").icon,
		colorClass: emailStatusTone("opened").text,
	},
	{
		id: "clicked",
		label: "Clicked",
		icon: emailStatusTone("clicked").icon,
		colorClass: emailStatusTone("clicked").text,
	},
	{
		id: "pending",
		label: "Pending",
		icon: emailStatusTone("pending").icon,
		colorClass: emailStatusTone("pending").text,
	},
	{
		id: "failed",
		label: "Failed",
		icon: emailStatusTone("failed").icon,
		colorClass: emailStatusTone("failed").text,
	},
	{
		id: "bounced",
		label: "Bounced",
		icon: emailStatusTone("bounced").icon,
		colorClass: emailStatusTone("bounced").text,
	},
	{
		id: "spam",
		label: "Spam",
		icon: "cross-circle",
		colorClass: "text-error-base",
	},
];

export const StatusSelector = ({
	value,
	onChange,
	className,
}: StatusSelectorProps) => {
	const selectedOption =
		statusOptions.find((o) => o.id === (value || null)) || statusOptions[0];

	return (
		<Select
			value={value === "" ? "all" : value}
			onValueChange={(val) => onChange(!val || val === "all" ? "" : val)}
		>
			<SelectTrigger className={cn("w-40", className)}>
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
