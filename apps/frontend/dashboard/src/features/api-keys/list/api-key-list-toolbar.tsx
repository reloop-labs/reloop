"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKey } from "@reloop/ui/kbd-key";
import type { VisibilityState } from "@tanstack/react-table";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
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

	useHotkeys(
		"r",
		(e) => {
			e.preventDefault();
			void invalidate();
		},
		{
			// Don't fire while typing in search/filters.
			enableOnFormTags: false,
			preventDefault: true,
		},
	);

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
						"gap-1.5 px-2",
					)}
					aria-label="Refresh API keys"
					aria-keyshortcuts="r"
					title="Refresh API keys"
				>
					<Icon name="rotate-cw" className="h-3.5 w-3.5" />
					{/* Physical keycap: face + bottom lip (matches Linear/macOS kbd) */}
					<KbdKey
						className={cn(
							"h-5 min-w-5 rounded-[6px] px-1",
							"border border-stroke-soft-200 bg-bg-weak-50 text-[10px] text-text-sub-600",
							// bottom shelf + soft pad under the key
							"shadow-[0_2px_0_0_var(--color-stroke-soft-200)]",
							"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
							"dark:shadow-[0_2px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
						)}
					>
						R
					</KbdKey>
				</button>
			</div>
		</div>
	);
}
