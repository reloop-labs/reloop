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
import { ChannelFilterChip } from "../../filters/channel-filter-chip";
import { ContactStatusFilterChip } from "../../filters/status-filter-chip";
import type { ContactViewColumnId } from "../../hooks/use-contact-column-visibility";
import { useInvalidateContacts } from "../../hooks/use-contacts-query";
import { ContactViewPopover } from "./contact-view-popover";

/** How long the rotate icon spins after a refresh is triggered. */
const REFRESH_SPIN_MS = 2000;
const SEARCH_INPUT_ID = "contact-list-search";

export function ContactListToolbar({
	columnVisibility,
	onColumnVisibleChange,
	onExport,
	canExport,
	channelFilter,
}: {
	columnVisibility: VisibilityState;
	onColumnVisibleChange: (id: ContactViewColumnId, visible: boolean) => void;
	onExport?: () => void;
	canExport?: boolean;
	channelFilter?: {
		id: string;
		name: string;
		onClear: () => void;
	};
}) {
	const [searchQuery, setSearchQuery] = useQueryState(
		"search",
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
	const invalidate = useInvalidateContacts();
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

	useHotkeys(
		"e",
		(e) => {
			e.preventDefault();
			if (canExport) onExport?.();
		},
		{
			enableOnFormTags: false,
			preventDefault: true,
			enabled: !!onExport,
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
							placeholder="Search contacts..."
							value={searchQuery}
							aria-keyshortcuts="/"
							aria-label="Search contacts"
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

				<ContactStatusFilterChip
					value={statusFilter}
					onChange={(status) => {
						void setStatusFilter(status);
						void setCurrentPage(1);
					}}
				/>

				{channelFilter ? (
					<ChannelFilterChip
						channelName={channelFilter.name}
						onClear={() => {
							channelFilter.onClear();
							void setCurrentPage(1);
						}}
					/>
				) : null}
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<ContactViewPopover
					columnVisibility={columnVisibility}
					onColumnVisibleChange={onColumnVisibleChange}
				/>
				{onExport ? (
					<Tooltip.Provider delayDuration={200}>
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<button
									type="button"
									onClick={onExport}
									disabled={!canExport}
									className={cn(
										dataTableToolbarControlClassName,
										"gap-2 px-1.5",
										canExport
											? "cursor-pointer"
											: "pointer-events-none opacity-50",
									)}
									aria-label="Export contacts CSV"
									aria-keyshortcuts="e"
								>
									<Icon name="file-download" className="h-3.5 w-3.5 shrink-0" />
									<ActionKbd>E</ActionKbd>
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
											name="file-download"
											className="h-3.5 w-3.5 text-text-sub-600"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-3">
											<p className="font-medium text-label-sm text-text-strong-950">
												Export CSV
											</p>
											<ActionKbd>E</ActionKbd>
										</div>
										<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
											Download all contacts as a CSV file.
										</p>
									</div>
								</div>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				) : null}
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
								aria-label="Refresh contacts"
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
											? "Fetching the latest contacts."
											: "Reload contacts from the server."}
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
