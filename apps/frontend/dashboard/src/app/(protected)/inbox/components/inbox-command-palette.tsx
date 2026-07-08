"use client";

import * as CommandMenu from "@reloop/ui/command";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import { Search, X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { InboundThread } from "../types";

type InboxFilterChip = "unread" | "starred" | "needs_approval";

const FILTER_OPTIONS: { id: InboxFilterChip; label: string; icon: string }[] =
	[
		{ id: "unread", label: "Unread", icon: "mail" },
		{ id: "starred", label: "Starred", icon: "star" },
		{ id: "needs_approval", label: "Needs approval", icon: "alert-triangle" },
	];

export const InboxCommandPalette = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [filterParam, setFilterParam] = useQueryState(
		"filter",
		parseAsString.withDefault(""),
	);

	const activeFilters = useMemo(() => {
		return filterParam.split(",").filter(Boolean) as InboxFilterChip[];
	}, [filterParam]);

	const toggleFilter = useCallback(
		(filter: InboxFilterChip) => {
			const next = activeFilters.includes(filter)
				? activeFilters.filter((f) => f !== filter)
				: [...activeFilters, filter];
			setFilterParam(next.length ? next.join(",") : null);
		},
		[activeFilters, setFilterParam],
	);

	const clearAll = useCallback(() => {
		setSearchQuery(null);
		setFilterParam(null);
		onOpenChange(false);
	}, [setSearchQuery, setFilterParam, onOpenChange]);

	useHotkeys(
		"mod+k",
		(e) => {
			e.preventDefault();
			onOpenChange(!open);
		},
		{ enableOnFormTags: true },
	);

	return (
		<CommandMenu.Dialog
			open={open}
			onOpenChange={onOpenChange}
			className="max-h-[min(420px,70vh)]"
		>
			<div className="group/cmd-input flex h-12 w-full items-center gap-2.5 bg-panel-light px-4 ">
				<Search className="size-4 shrink-0 text-mail-muted" />
				<CommandMenu.Input
					value={searchQuery}
					onValueChange={(v) => setSearchQuery(v || null)}
					placeholder="Search mail..."
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => setSearchQuery(null)}
						className="flex size-5 shrink-0 items-center justify-center rounded text-mail-muted hover:text-mail-muted"
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>
			<CommandMenu.List>
				<CommandMenu.Empty>No results.</CommandMenu.Empty>
				<CommandMenu.Group heading="Filters">
					{FILTER_OPTIONS.map((opt) => (
						<CommandMenu.Item
							key={opt.id}
							value={opt.label}
							onSelect={() => toggleFilter(opt.id)}
						>
							<Icon name={opt.icon as "mail"} className="mr-2 h-4 w-4" />
							<span>{opt.label}</span>
							{activeFilters.includes(opt.id) && (
								<span className="ml-auto text-mail-foreground text-xs">
									Active
								</span>
							)}
						</CommandMenu.Item>
					))}
				</CommandMenu.Group>
				{(searchQuery || activeFilters.length > 0) && (
					<CommandMenu.Group>
						<CommandMenu.Item value="clear all filters" onSelect={clearAll}>
							<X className="mr-2 h-4 w-4" />
							Clear all filters
						</CommandMenu.Item>
					</CommandMenu.Group>
				)}
			</CommandMenu.List>
		</CommandMenu.Dialog>
	);
};

export const InboxSearchTrigger = ({
	onOpenPalette,
	activeFilterCount,
}: {
	onOpenPalette: () => void;
	activeFilterCount: number;
}) => {
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

	return (
		<button
			type="button"
			onClick={onOpenPalette}
			className={cn(
				"relative flex h-10 flex-1 select-none items-center justify-start overflow-hidden rounded-lg border border-mail-border/20 bg-panel-dark/40 pl-3 text-left text-sm font-normal shadow-none backdrop-blur-sm transition-all hover:bg-mail-accent/30 focus-visible:ring-2 focus-visible:ring-mail-primary/30",
			)}
		>
			<Search className="h-4 w-4 text-mail-muted" />
			<span className="ml-3 truncate pr-20 text-mail-muted">
				{searchQuery
					? searchQuery
					: activeFilterCount > 0
						? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}`
						: "Search"}
			</span>
			<div className="absolute right-2 flex items-center gap-1.5">
				{activeFilterCount > 0 && (
					<span className="rounded-md bg-offset-light px-1.5 py-0.5 font-medium text-[10px] text-mail-muted bg-mail-accent">
						{activeFilterCount}
					</span>
				)}
				<KbdKeyOutline className="hidden sm:flex">⌘K</KbdKeyOutline>
			</div>
		</button>
	);
};

export function useInboxActiveFilterCount() {
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [filterParam] = useQueryState("filter", parseAsString.withDefault(""));

	return useMemo(() => {
		let count = 0;
		if (searchQuery.trim()) count++;
		if (filterParam) count += filterParam.split(",").filter(Boolean).length;
		return count;
	}, [searchQuery, filterParam]);
}

export function applyInboxFilters(
	threads: InboundThread[],
	searchQuery: string,
	filterParam: string,
): InboundThread[] {
	const filters = filterParam.split(",").filter(Boolean) as InboxFilterChip[];
	let result = threads;

	if (searchQuery.trim()) {
		const q = searchQuery.toLowerCase();
		result = result.filter(
			(t) =>
				t.subject.toLowerCase().includes(q) ||
				t.preview.toLowerCase().includes(q) ||
				t.from.email.toLowerCase().includes(q) ||
				t.from.name?.toLowerCase().includes(q),
		);
	}

	if (filters.includes("unread")) {
		result = result.filter((t) => t.unread);
	}
	if (filters.includes("starred")) {
		result = result.filter((t) => t.isStarred);
	}
	if (filters.includes("needs_approval")) {
		result = result.filter((t) => t.status === "needs_approval");
	}

	return result;
}
