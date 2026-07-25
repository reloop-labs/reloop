import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import { useInvalidateWebhooks } from "#/features/webhooks/hooks/use-webhooks-query";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";

interface WebhookToolbarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
}

const statusOptions: {
	id: string;
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
		id: "paused",
		label: "Paused",
		icon: "pause-circle",
		colorClass: "text-warning-base",
	},
	{
		id: "disabled",
		label: "Disabled",
		icon: "minus-circle",
		colorClass: "text-text-sub-600",
	},
	{
		id: "failed",
		label: "Failed",
		icon: "alert-circle",
		colorClass: "text-error-base",
	},
];

export const WebhookToolbar = ({
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
}: WebhookToolbarProps) => {
	const invalidate = useInvalidateWebhooks();
	const selectedOption =
		statusOptions.find((o) => o.id === statusFilter) || statusOptions[0];

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1">
				<Input.Root size="small" className="rounded-xl">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							type="text"
							placeholder="Search endpoints..."
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
						{searchQuery && (
							<button
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => onSearchChange("")}
								className="mr-1 rounded p-0.5 text-text-soft-400 transition-colors hover:bg-neutral-alpha-10 hover:text-text-strong-950"
							>
								<Icon name="cross" className="h-3 w-3" />
							</button>
						)}
					</Input.Wrapper>
				</Input.Root>
			</div>
			<div className="flex items-center gap-2">
				<Select
					value={statusFilter || "all"}
					onValueChange={(val) =>
						onStatusFilterChange(!val || val === "all" ? "all" : val)
					}
				>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="All Status">
							{selectedOption?.icon ? (
								<Icon
									name={selectedOption.icon}
									className={cn(
										"h-4 w-4 shrink-0",
										selectedOption.colorClass,
									)}
								/>
							) : null}
							<span className="min-w-0 truncate">{selectedOption?.label}</span>
						</SelectValue>
					</SelectTrigger>
					<SelectContent className="w-40">
						{statusOptions.map((option) => (
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
				<button
					type="button"
					onClick={() => void invalidate()}
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40"
					title="Refresh webhooks"
				>
					<Icon name="rotate-cw" className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
};
