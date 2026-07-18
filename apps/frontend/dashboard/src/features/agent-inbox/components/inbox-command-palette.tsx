import { cn } from "@reloop/ui/cn";
import * as CommandMenu from "@reloop/ui/command";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdKey } from "@reloop/ui/kbd-key";
import {
	ArrowRight,
	Clock,
	FileText,
	Hash,
	Mail,
	Paperclip,
	PenSquare,
	X as XIcon,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { InboundThread } from "../types";
import { useInboxSidebar } from "./inbox-sidebar-context";

type InboxFilterChip =
	| "unread"
	| "starred"
	| "needs_approval"
	| "has_attachment";

type PaletteView = "main" | "search";

const RECENT_SEARCHES_KEY = "reloop-inbox-recent-searches";
const MAX_RECENT = 10;

const FILTER_OPTIONS: {
	id: InboxFilterChip;
	label: string;
	icon: React.ReactNode;
}[] = [
	{
		id: "unread",
		label: "Unread",
		icon: <Mail className="h-4 w-4 opacity-60" />,
	},
	{
		id: "starred",
		label: "Starred",
		icon: <Icon name="star" className="h-4 w-4 opacity-60" />,
	},
	{
		id: "needs_approval",
		label: "Needs approval",
		icon: <Icon name="alert-triangle" className="h-4 w-4 opacity-60" />,
	},
	{
		id: "has_attachment",
		label: "Has attachment",
		icon: <Paperclip className="h-4 w-4 opacity-60" />,
	},
];

const FILTER_LABELS: Record<InboxFilterChip, string> = {
	unread: "Unread",
	starred: "Starred",
	needs_approval: "Needs approval",
	has_attachment: "Has attachment",
};

const loadRecentSearches = (): string[] => {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		return Array.isArray(parsed)
			? parsed.filter((s): s is string => typeof s === "string")
			: [];
	} catch {
		return [];
	}
};

const saveRecentSearch = (query: string) => {
	const trimmed = query.trim();
	if (!trimmed) return;
	const prev = loadRecentSearches().filter(
		(s) => s.toLowerCase() !== trimmed.toLowerCase(),
	);
	const next = [trimmed, ...prev].slice(0, MAX_RECENT);
	localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
};

export const InboxCommandPalette = ({
	open,
	onOpenChange,
	threads = [],
	onSelectThread,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	threads?: InboundThread[];
	onSelectThread?: (id: string) => void;
}) => {
	const { openCompose } = useInboxSidebar();
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [filterParam, setFilterParam] = useQueryState(
		"filter",
		parseAsString.withDefault(""),
	);

	const [view, setView] = useState<PaletteView>("main");
	const [draftQuery, setDraftQuery] = useState("");
	const [commandInput, setCommandInput] = useState("");
	const [recentSearches, setRecentSearches] = useState<string[]>([]);

	const activeFilters = useMemo(() => {
		return filterParam.split(",").filter(Boolean) as InboxFilterChip[];
	}, [filterParam]);

	useEffect(() => {
		if (!open) return;
		setView("main");
		setDraftQuery(searchQuery);
		setCommandInput("");
		setRecentSearches(loadRecentSearches());
	}, [open, searchQuery]);

	const toggleFilter = useCallback(
		(filter: InboxFilterChip) => {
			const next = activeFilters.includes(filter)
				? activeFilters.filter((f) => f !== filter)
				: [...activeFilters, filter];
			void setFilterParam(next.length ? next.join(",") : null);
		},
		[activeFilters, setFilterParam],
	);

	const removeFilter = useCallback(
		(filter: InboxFilterChip) => {
			const next = activeFilters.filter((f) => f !== filter);
			void setFilterParam(next.length ? next.join(",") : null);
		},
		[activeFilters, setFilterParam],
	);

	const clearAllFilters = useCallback(() => {
		void setSearchQuery(null);
		void setFilterParam(null);
		setDraftQuery("");
	}, [setSearchQuery, setFilterParam]);

	const applySearch = useCallback(
		(query: string, close = true) => {
			const trimmed = query.trim();
			void setSearchQuery(trimmed || null);
			if (trimmed) {
				saveRecentSearch(trimmed);
				setRecentSearches(loadRecentSearches());
			}
			if (close) onOpenChange(false);
		},
		[setSearchQuery, onOpenChange],
	);

	const quickResults = useMemo(() => {
		const q = draftQuery.trim().toLowerCase();
		if (q.length < 2) return [];
		return threads
			.filter(
				(t) =>
					t.subject.toLowerCase().includes(q) ||
					t.preview.toLowerCase().includes(q) ||
					t.from.email.toLowerCase().includes(q) ||
					(t.from.name?.toLowerCase().includes(q) ?? false),
			)
			.slice(0, 5);
	}, [draftQuery, threads]);

	useHotkeys(
		"mod+k",
		(e) => {
			e.preventDefault();
			onOpenChange(!open);
		},
		{ enableOnFormTags: true },
	);

	useHotkeys(
		"mod+shift+f",
		(e) => {
			e.preventDefault();
			clearAllFilters();
		},
		{ enableOnFormTags: true, enabled: open },
	);

	const runAndClose = useCallback(
		(fn: () => void) => {
			fn();
			onOpenChange(false);
		},
		[onOpenChange],
	);

	return (
		<CommandMenu.Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setView("main");
				onOpenChange(next);
			}}
			overlayClassName="justify-center pt-0"
			className="max-h-[min(480px,75vh)] max-w-lg rounded-xl border-none bg-white p-0 shadow-lg dark:bg-[#202020]"
		>
			{view === "main" ? (
				<>
					{activeFilters.length > 0 && (
						<div className="border-mail-border border-b px-3 py-2">
							<div className="mb-1 flex items-center justify-between">
								<span className="text-mail-muted text-xs">Active Filters</span>
								<button
									type="button"
									onClick={clearAllFilters}
									className="h-6 rounded px-2 text-mail-muted text-xs transition-colors hover:text-mail-foreground"
								>
									Clear All
								</button>
							</div>
							<div className="flex flex-wrap gap-1">
								{activeFilters.map((filter) => (
									<span
										key={filter}
										className="inline-flex items-center gap-1 rounded-md bg-[var(--inbox-muted-bg)] pr-1 pl-2 text-mail-foreground text-xs"
									>
										{FILTER_LABELS[filter]}
										<button
											type="button"
											onClick={() => removeFilter(filter)}
											className="rounded p-0.5 hover:text-red-500"
											aria-label={`Remove ${FILTER_LABELS[filter]}`}
										>
											<XIcon className="h-3 w-3" />
										</button>
									</span>
								))}
								{searchQuery.trim() && (
									<span className="inline-flex items-center gap-1 rounded-md bg-[var(--inbox-muted-bg)] pr-1 pl-2 text-mail-foreground text-xs">
										“{searchQuery.trim()}”
										<button
											type="button"
											onClick={() => {
												void setSearchQuery(null);
												setDraftQuery("");
											}}
											className="rounded p-0.5 hover:text-red-500"
											aria-label="Clear search"
										>
											<XIcon className="h-3 w-3" />
										</button>
									</span>
								)}
							</div>
						</div>
					)}

					<div className="group/cmd-input flex h-12 w-full items-center gap-2.5 border-mail-border border-b px-4">
						<Icon name="search" className="h-4 w-4 shrink-0 text-mail-muted" />
						<CommandMenu.Input
							value={commandInput}
							onValueChange={setCommandInput}
							placeholder="Type a command or search..."
							onKeyDown={(e) => {
								if (e.key === "Enter" && commandInput.trim()) {
									const match = FILTER_OPTIONS.some((o) =>
										o.label
											.toLowerCase()
											.includes(commandInput.trim().toLowerCase()),
									);
									if (!match) {
										e.preventDefault();
										applySearch(commandInput, true);
									}
								}
							}}
						/>
					</div>

					<CommandMenu.List className="max-h-80">
						<CommandMenu.Empty>
							No results found. Press <span className="font-bold">Enter</span>{" "}
							to search mail.
						</CommandMenu.Empty>

						<CommandMenu.Group heading="Search">
							<CommandMenu.Item
								value="search emails"
								onSelect={() => {
									setView("search");
									setDraftQuery(searchQuery);
								}}
							>
								<Icon name="search" className="h-4 w-4 opacity-60" />
								<div className="ml-2 flex flex-1 flex-col">
									<span>Search emails</span>
									<span className="text-mail-muted text-xs">
										Find messages by name, subject, or content
									</span>
								</div>
							</CommandMenu.Item>
							<CommandMenu.Item
								value="compose new email"
								onSelect={() => runAndClose(openCompose)}
							>
								<PenSquare className="h-4 w-4 opacity-60" />
								<span className="ml-2">Compose new email</span>
							</CommandMenu.Item>
						</CommandMenu.Group>

						<CommandMenu.Group heading="Quick Filters">
							{FILTER_OPTIONS.map((opt) => (
								<CommandMenu.Item
									key={opt.id}
									value={opt.label}
									onSelect={() => toggleFilter(opt.id)}
								>
									{opt.icon}
									<span className="ml-2">{opt.label}</span>
									{activeFilters.includes(opt.id) && (
										<span className="ml-auto text-mail-muted text-xs">
											Active
										</span>
									)}
								</CommandMenu.Item>
							))}
						</CommandMenu.Group>

						{(searchQuery || activeFilters.length > 0) && (
							<CommandMenu.Group>
								<CommandMenu.Item
									value="clear all filters"
									onSelect={() => {
										clearAllFilters();
										onOpenChange(false);
									}}
								>
									<XIcon className="h-4 w-4 opacity-60" />
									<span className="ml-2">Clear all filters</span>
								</CommandMenu.Item>
							</CommandMenu.Group>
						)}
					</CommandMenu.List>
				</>
			) : (
				<>
					<div className="flex items-center border-mail-border border-b px-3">
						<button
							type="button"
							className="relative top-0.5 mr-2 text-mail-muted transition-colors hover:text-mail-foreground"
							onClick={() => setView("main")}
							aria-label="Back"
						>
							←
						</button>
						<div className="group/cmd-input flex h-12 min-w-0 flex-1 items-center gap-2.5">
							<CommandMenu.Input
								autoFocus
								value={draftQuery}
								onValueChange={setDraftQuery}
								placeholder="Search your emails..."
								className="border-none"
								onKeyDown={(e) => {
									if (e.key === "Enter" && draftQuery.trim()) {
										e.preventDefault();
										applySearch(draftQuery, true);
									}
									if (e.key === "Escape") {
										e.preventDefault();
										setView("main");
									}
								}}
							/>
							{draftQuery && (
								<button
									type="button"
									onClick={() => setDraftQuery("")}
									className="flex size-5 shrink-0 items-center justify-center rounded text-mail-muted hover:text-mail-foreground"
								>
									<XIcon className="size-3.5" />
								</button>
							)}
						</div>
					</div>

					<CommandMenu.List className="max-h-80">
						<CommandMenu.Empty>Type to search your emails...</CommandMenu.Empty>

						{recentSearches.length > 0 && !draftQuery && (
							<CommandMenu.Group heading="Recent Searches">
								{recentSearches.map((search) => (
									<CommandMenu.Item
										key={search}
										value={`recent ${search}`}
										onSelect={() => applySearch(search, true)}
									>
										<Clock className="h-4 w-4 opacity-60" />
										<span className="ml-2">{search}</span>
									</CommandMenu.Item>
								))}
							</CommandMenu.Group>
						)}

						{quickResults.length > 0 && (
							<CommandMenu.Group heading="Quick Results">
								{quickResults.map((thread) => (
									<CommandMenu.Item
										key={thread.id}
										value={`thread ${thread.subject} ${thread.from.email}`}
										onSelect={() => {
											runAndClose(() => {
												void setSearchQuery(null);
												onSelectThread?.(thread.id);
											});
										}}
									>
										<Mail className="h-4 w-4 shrink-0 opacity-60" />
										<div className="ml-2 flex min-w-0 flex-1 flex-col overflow-hidden">
											<span className="truncate font-medium">
												{thread.subject || "(No Subject)"}
											</span>
											<span className="truncate text-mail-muted text-xs">
												{thread.from.name || thread.from.email}
												{thread.preview ? ` — ${thread.preview}` : ""}
											</span>
										</div>
									</CommandMenu.Item>
								))}
							</CommandMenu.Group>
						)}

						{draftQuery.trim() && (
							<CommandMenu.Group heading="Search Suggestions">
								<CommandMenu.Item
									value={`search for ${draftQuery}`}
									onSelect={() => applySearch(draftQuery, true)}
								>
									<Icon name="search" className="h-4 w-4 opacity-60" />
									<span className="ml-2">Search for “{draftQuery.trim()}”</span>
								</CommandMenu.Item>
								{draftQuery.includes("@") && (
									<CommandMenu.Item
										value={`from ${draftQuery}`}
										onSelect={() => {
											const email = draftQuery.trim();
											void setFilterParam(null);
											applySearch(email, true);
										}}
									>
										<Mail className="h-4 w-4 opacity-60" />
										<span className="ml-2">From: {draftQuery.trim()}</span>
									</CommandMenu.Item>
								)}
								<CommandMenu.Item
									value={`subject ${draftQuery}`}
									onSelect={() => applySearch(draftQuery, true)}
								>
									<FileText className="h-4 w-4 opacity-60" />
									<span className="ml-2">
										Subject contains: “{draftQuery.trim()}”
									</span>
								</CommandMenu.Item>
								<CommandMenu.Item
									value={`body ${draftQuery}`}
									onSelect={() => applySearch(draftQuery, true)}
								>
									<Hash className="h-4 w-4 opacity-60" />
									<span className="ml-2">
										Body contains: “{draftQuery.trim()}”
									</span>
								</CommandMenu.Item>
							</CommandMenu.Group>
						)}

						{!draftQuery && (
							<CommandMenu.Group heading="Try searching">
								{["unread", "meeting", "invoice", "from last week"].map(
									(example) => (
										<CommandMenu.Item
											key={example}
											value={`example ${example}`}
											onSelect={() => {
												setDraftQuery(example);
												applySearch(example, true);
											}}
										>
											<ArrowRight className="h-4 w-4 opacity-60" />
											<span className="ml-2 text-mail-muted italic">
												{example}
											</span>
										</CommandMenu.Item>
									),
								)}
							</CommandMenu.Group>
						)}
					</CommandMenu.List>
				</>
			)}
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
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [filterParam, setFilterParam] = useQueryState(
		"filter",
		parseAsString.withDefault(""),
	);

	const filterLabels = useMemo(() => {
		return filterParam
			.split(",")
			.filter(Boolean)
			.map((f) => FILTER_LABELS[f as InboxFilterChip] ?? f);
	}, [filterParam]);

	const displayText = useMemo(() => {
		if (searchQuery.trim()) return searchQuery;
		if (filterLabels.length > 0) return filterLabels.join(", ");
		return "Search";
	}, [searchQuery, filterLabels]);

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		void setSearchQuery(null);
		void setFilterParam(null);
	};

	return (
		<button
			type="button"
			onClick={onOpenPalette}
			className={cn(
				"relative flex h-10 w-full flex-1 select-none items-center justify-start overflow-hidden rounded-2xl border border-mail-border/20 bg-panel-light pl-3 text-left font-normal text-sm shadow-none hover:bg-mail-accent/30 focus-visible:ring-2 focus-visible:ring-mail-primary/30 dark:bg-panel-dark/40",
			)}
		>
			<Icon name="search" className="h-4 w-4 text-mail-muted" />
			<span
				className={cn(
					"ml-3 truncate pr-24",
					searchQuery || activeFilterCount > 0
						? "text-mail-foreground"
						: "text-mail-muted",
				)}
			>
				<span className="hidden lg:inline">{displayText}</span>
				<span className="lg:hidden">
					{activeFilterCount > 0
						? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}`
						: searchQuery || "Search"}
				</span>
			</span>
			<div className="absolute right-2 flex items-center gap-1.5">
				{activeFilterCount > 0 && (
					<button
						type="button"
						onClick={handleClear}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleClear(e as unknown as React.MouseEvent);
							}
						}}
						className="inline-flex h-6 items-center rounded-md bg-[var(--inbox-muted-bg)] px-2 font-medium text-mail-foreground text-xs transition-colors hover:bg-[var(--inbox-control-hover)]"
					>
						Clear
					</button>
				)}
				<span className="pointer-events-none hidden items-center gap-0.5 sm:inline-flex">
					<KbdCommand className="h-3.5 w-3.5 border-mail-border/40 p-0 text-mail-muted dark:border-white/15" />
					<KbdKey className="h-3.5 w-3.5 border-mail-border/40 p-0 text-[9px] text-mail-muted dark:border-white/15">
						K
					</KbdKey>
				</span>
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
	if (filters.includes("has_attachment")) {
		result = result.filter((t) => (t.attachments?.length ?? 0) > 0);
	}

	return result;
}
