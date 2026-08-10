import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { useCallback } from "react";
import { useToolbarRefresh } from "#/components/data-table/use-toolbar-refresh";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import { useAgentInbox } from "../components/agent-inbox-provider";
import type { AgentMailbox } from "../types";

type MailboxStatus = AgentMailbox["status"];
type StatusFilter = MailboxStatus | null;

const statusFilterOptions: {
	id: StatusFilter;
	label: string;
	icon: string;
	colorClass: string;
}[] = [
	{ id: null, label: "All Status", icon: "activity", colorClass: "" },
	{
		id: "active",
		label: "Active",
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

function MailboxStatusFilterDropdown({
	value,
	onChange,
}: {
	value: StatusFilter;
	onChange: (value: StatusFilter) => void;
}) {
	const selectedOption =
		statusFilterOptions.find((o) => o.id === value) || statusFilterOptions[0];

	return (
		<Select
			value={value === null ? "all" : value}
			onValueChange={(val) =>
				onChange(val === "all" ? null : (val as MailboxStatus))
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

export function AgentMailboxListToolbar() {
	const { refresh: refreshMailboxes } = useAgentInbox();
	const onRefresh = useCallback(() => {
		void refreshMailboxes();
	}, [refreshMailboxes]);
	const { isRefreshing, refresh } = useToolbarRefresh(onRefresh);
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsStringLiteral(["active", "disabled"] as const),
	);
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1">
				<Input.Root size="small" className="rounded-xl">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							placeholder="Search addresses..."
							value={searchQuery}
							onChange={(e) => {
								void setSearchQuery(e.target.value);
								void setCurrentPage(1);
							}}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<div className="flex items-center gap-2">
				<MailboxStatusFilterDropdown
					value={statusFilter}
					onChange={(filters) => {
						void setStatusFilter(filters);
						void setCurrentPage(1);
					}}
				/>
				<button
					type="button"
					onClick={refresh}
					disabled={isRefreshing}
					className={cn(
						"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40",
						isRefreshing ? "pointer-events-none" : "cursor-pointer",
					)}
					title="Refresh addresses"
					aria-label="Refresh addresses"
					aria-busy={isRefreshing}
				>
					<Icon
						name="rotate-cw"
						className={cn("h-4 w-4", isRefreshing && "animate-spin")}
					/>
				</button>
			</div>
		</div>
	);
}
