"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { dataTableToolbarControlClassName } from "#/components/data-table/toolbar-control";

export function ChannelFilterChip({
	channelName,
	onClear,
}: {
	channelName: string;
	onClear: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClear}
			className={cn(
				dataTableToolbarControlClassName,
				"max-w-56 gap-1.5 px-2",
			)}
			aria-label={`Clear channel filter: ${channelName}`}
			title="Clear channel filter"
		>
			<Icon name="users" className="h-3.5 w-3.5 shrink-0 text-text-sub-600" />
			<span className="min-w-0 truncate">
				<span className="text-text-sub-600">Channel:</span>{" "}
				<span className="text-text-strong-950">{channelName}</span>
			</span>
			<Icon name="cross" className="h-3 w-3 shrink-0 text-text-sub-600" />
		</button>
	);
}
