"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Tooltip from "@reloop/ui/tooltip";
import type { VisibilityState } from "@tanstack/react-table";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { dataTableToolbarControlClassName } from "#/components/data-table/toolbar-control";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { DomainStatusFilterChip } from "../filters/status-filter-chip";
import type { DomainViewColumnId } from "../hooks/use-domain-column-visibility";
import { useInvalidateDomains } from "../hooks/use-domains-query";
import { DomainViewPopover } from "./domain-view-popover";

/** How long the rotate icon spins after a refresh is triggered. */
const REFRESH_SPIN_MS = 2000;
const SEARCH_INPUT_ID = "domain-list-search";

export function DomainListToolbar({
	columnVisibility,
	onColumnVisibleChange,
}: {
	columnVisibility: VisibilityState;
	onColumnVisibleChange: (id: DomainViewColumnId, visible: boolean) => void;
}) {
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);

	const searchInputRef = useRef<HTMLInputElement>(null);
	const invalidate = useInvalidateDomains();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const refresh = useCallback(() => {
		void invalidate();
		setIsRefreshing(true);
		if (spinTimeoutRef.current != null) {
			clearTimeout(spinTimeoutRef.current);
		}
		spinTimeoutRef.current = setTimeout(() => {
			setIsRefreshing(false);
			spinTimeoutRef.current = null;
		}, REFRESH_SPIN_MS);
	}, [invalidate]);

	const focusSearch = useCallback(() => {
		const input =
			searchInputRef.current ?? document.getElementById(SEARCH_INPUT_ID);
		if (!(input instanceof HTMLInputElement)) return;
		input.focus();
		input.select();
	}, []);

	useEffect(() => {
		return () => {
			if (spinTimeoutRef.current != null) {
				clearTimeout(spinTimeoutRef.current);
			}
		};
	}, []);

	useHotkeys(
		"r",
		(e) => {
			e.preventDefault();
			refresh();
		},
		{
			enableOnFormTags: false,
			preventDefault: true,
		},
	);

	useHotkeys(
		"slash",
		(e) => {
			e.preventDefault();
			focusSearch();
		},
		{
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
							id={SEARCH_INPUT_ID}
							ref={searchInputRef}
							placeholder="Search domains..."
							value={searchQuery}
							aria-keyshortcuts="/"
							aria-label="Search domains"
							onChange={(e) => {
								void setSearchQuery(e.target.value);
								void setCurrentPage(1);
							}}
						/>
						<button
							type="button"
							tabIndex={-1}
							aria-label="Focus search"
							onMouseDown={(e) => {
								e.preventDefault();
								focusSearch();
							}}
							className="shrink-0 cursor-pointer rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950"
						>
							<ActionKbd>/</ActionKbd>
						</button>
					</Input.Wrapper>
				</Input.Root>

				<DomainStatusFilterChip
					value={statusFilter}
					onChange={(status) => {
						void setStatusFilter(status);
						void setCurrentPage(1);
					}}
				/>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<DomainViewPopover
					columnVisibility={columnVisibility}
					onColumnVisibleChange={onColumnVisibleChange}
				/>
				<Tooltip.Provider delayDuration={200}>
					<Tooltip.Root>
						<Tooltip.Trigger asChild>
							<button
								type="button"
								onClick={refresh}
								disabled={isRefreshing}
								className={cn(
									dataTableToolbarControlClassName,
									"gap-2 px-1.5",
									isRefreshing ? "pointer-events-none" : "cursor-pointer",
								)}
								aria-label="Refresh domains"
								aria-keyshortcuts="r"
								aria-busy={isRefreshing}
							>
								<Icon
									name="rotate-cw"
									className={cn(
										"h-3.5 w-3.5 shrink-0",
										isRefreshing && "animate-spin",
									)}
								/>
								<ActionKbd>R</ActionKbd>
							</button>
						</Tooltip.Trigger>
						<Tooltip.Content
							side="top"
							sideOffset={-1}
							size="medium"
							variant="light"
							className="max-w-63 p-2.5"
						>
							<div className="flex items-start gap-2.5">
								<div
									className={cn(
										"mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
										"bg-bg-weak-50 ring-1 ring-stroke-soft-200",
									)}
									aria-hidden
								>
									<Icon
										name="rotate-cw"
										className={cn(
											"h-3.5 w-3.5 text-text-sub-600",
											isRefreshing && "animate-spin",
										)}
									/>
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-3">
										<p className="font-medium text-label-sm text-text-strong-950">
											{isRefreshing ? "Refreshing…" : "Refresh"}
										</p>
										<ActionKbd>R</ActionKbd>
									</div>
									<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
										{isRefreshing
											? "Fetching the latest domains."
											: "Reload domains from the server."}
									</p>
								</div>
							</div>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		</div>
	);
}
