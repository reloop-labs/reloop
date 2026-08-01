import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import type { VisibilityState } from "@tanstack/react-table";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { dataTableToolbarControlClassName } from "#/components/data-table/toolbar-control";
import { ApiKeyStatusFilterChip } from "../filters/status-filter-chip";
import { ApiKeyUserFilterChip } from "../filters/user-filter-chip";
import type { ApiKeyViewColumnId } from "../hooks/use-api-key-column-visibility";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import { ApiKeyViewPopover } from "../table/api-key-view-popover";
import type { CreatedByUser } from "../types";

export function ApiKeyListToolbar({
	availableCreators,
	columnVisibility,
	onColumnVisibleChange,
}: {
	availableCreators: CreatedByUser[];
	columnVisibility: VisibilityState;
	onColumnVisibleChange: (id: ApiKeyViewColumnId, visible: boolean) => void;
}) {
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [creatorFilter, setCreatorFilter] = useQueryState(
		"creator",
		parseAsString.withDefault(""),
	);
	const [, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);

	const invalidate = useInvalidateApiKeys();

	return (
		<div
			role="toolbar"
			aria-orientation="horizontal"
			className="flex w-full items-start justify-between gap-2"
		>
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
				<Input.Root
					size="small"
					className="w-40 rounded-xl shadow-none! lg:w-56"
				>
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							placeholder="Search API keys..."
							value={searchQuery}
							onChange={(e) => {
								void setSearchQuery(e.target.value);
								void setCurrentPage(1);
							}}
						/>
					</Input.Wrapper>
				</Input.Root>

				<ApiKeyStatusFilterChip
					value={statusFilter}
					onChange={(status) => {
						void setStatusFilter(status);
						void setCurrentPage(1);
					}}
				/>
				<ApiKeyUserFilterChip
					value={creatorFilter || null}
					onChange={(userId) => {
						void setCreatorFilter(userId || "");
						void setCurrentPage(1);
					}}
					availableCreators={availableCreators}
				/>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<ApiKeyViewPopover
					columnVisibility={columnVisibility}
					onColumnVisibleChange={onColumnVisibleChange}
				/>
				<button
					type="button"
					onClick={() => void invalidate()}
					className={cn(
						dataTableToolbarControlClassName,
						"w-8 justify-center px-0",
					)}
					title="Refresh API keys"
				>
					<Icon name="rotate-cw" className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}
