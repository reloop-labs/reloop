import { cn } from "@reloop/ui/cn";
import * as CommandMenu from "@reloop/ui/command";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdKey } from "@reloop/ui/kbd-key";
import { Logo } from "@reloop/ui/logo";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useTheme } from "next-themes";
import { parseAsString, useQueryState } from "nuqs";
import {
	type ComponentProps,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { parseEmail } from "#/features/agent-inbox/lib/email-address";
import {
	FILTER_LABELS,
	INBOX_FILTER_CHIPS,
	type InboxFilterChip,
	mergeFilterParam,
	parseInboxQuery,
	serializeSearchText,
	threadMatchesQuery,
} from "#/features/agent-inbox/lib/inbox-search-query";
import { useMailboxId } from "#/features/agent-inbox/lib/use-mailbox-id";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import type { InboundThread } from "../types";
import { useInboxSidebar } from "./inbox-sidebar-context";

export { applyInboxFilters } from "#/features/agent-inbox/lib/inbox-search-query";

type UiIconName = ComponentProps<typeof Icon>["name"];

/**
 * Raycast-like palette: one uniform surface, dense 40px rows,
 * title + muted subtitle, right-aligned type, keycaps after labels.
 */
const paletteItemClass = cn(
	"h-10 gap-3 rounded-[8px] px-3 py-0 text-[13px] text-mail-foreground leading-none",
	"data-[selected=true]:bg-black/[0.06] dark:data-[selected=true]:bg-white/[0.1]",
);
const paletteGroupClass = cn(
	// Override CommandGroup's default py-3 so the list doesn't leave a dead zone
	"px-0 py-0",
	"[&>[cmdk-group-heading]]:mb-1 [&>[cmdk-group-heading]]:px-3 [&>[cmdk-group-heading]]:pt-2",
	"[&>[cmdk-group-heading]]:pb-0",
	"[&>[cmdk-group-heading]]:font-normal [&>[cmdk-group-heading]]:text-[12px] [&>[cmdk-group-heading]]:text-mail-muted/80",
	"[&>[cmdk-group-heading]]:normal-case [&>[cmdk-group-heading]]:tracking-normal",
);
const paletteInputClass = cn(
	"h-full text-[16px] text-mail-foreground leading-none",
	"placeholder:text-mail-muted/55",
);

function AppIcon({ name }: { name: UiIconName }) {
	return (
		<div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-black/[0.05] text-mail-foreground dark:bg-white/[0.08]">
			<Icon name={name} className="h-3.5 w-3.5" />
		</div>
	);
}

function Keycap({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-[5px] border border-black/[0.08] bg-black/[0.03] px-1.5 font-medium text-[11px] text-mail-muted",
				"dark:border-white/[0.1] dark:bg-white/[0.06]",
				className,
			)}
		>
			{children}
		</span>
	);
}

function ItemMeta({ children }: { children: ReactNode }) {
	return (
		<span className="ml-auto shrink-0 text-[12px] text-mail-muted/70">
			{children}
		</span>
	);
}

function ItemTitle({ title, subtitle }: { title: string; subtitle?: string }) {
	return (
		<span className="flex min-w-0 flex-1 items-baseline gap-2 truncate">
			<span className="truncate text-mail-foreground">{title}</span>
			{subtitle ? (
				<span className="truncate text-mail-muted/65">{subtitle}</span>
			) : null}
		</span>
	);
}

/** Same icon set as the inbox sidebar where possible */
const FILTER_ICONS: Record<InboxFilterChip, UiIconName> = {
	unread: "mail",
	starred: "star",
	needs_approval: "alert-triangle",
	has_attachment: "file",
};

function operatorIcon(opId: string, apply: string): UiIconName {
	const chip = INBOX_FILTER_CHIPS.find((c) => c.operator === apply);
	if (chip) return FILTER_ICONS[chip.id];
	if (opId === "op-from" || apply.startsWith("from:")) return "mail";
	if (opId === "op-to" || apply.startsWith("to:")) return "sent";
	if (opId === "op-subject" || apply.startsWith("subject:")) return "file";
	return "search";
}

const RECENT_SEARCHES_KEY = "reloop-inbox-recent-searches";
const MAX_RECENT = 10;

type FolderJump = {
	id: string;
	label: string;
	keywords: string;
	icon: UiIconName;
	to:
		| "/inbox/$mailboxId"
		| "/inbox/$mailboxId/agent"
		| "/inbox/$mailboxId/sent"
		| "/inbox/$mailboxId/drafts"
		| "/inbox/$mailboxId/archive";
	/** Optional filter applied after navigation */
	filter?: InboxFilterChip;
};

const FOLDER_JUMPS: FolderJump[] = [
	{
		id: "inbox",
		label: "Inbox",
		keywords: "inbox mail home",
		icon: "inbox",
		to: "/inbox/$mailboxId",
	},
	{
		id: "agent",
		label: "Agent",
		keywords: "agent ai",
		icon: "agent",
		to: "/inbox/$mailboxId/agent",
	},
	{
		id: "sent",
		label: "Sent",
		keywords: "sent outbound",
		icon: "sent",
		to: "/inbox/$mailboxId/sent",
	},
	{
		id: "drafts",
		label: "Drafts",
		keywords: "drafts compose",
		icon: "draft",
		to: "/inbox/$mailboxId/drafts",
	},
	{
		id: "archive",
		label: "Archive",
		keywords: "archive",
		icon: "archive",
		to: "/inbox/$mailboxId/archive",
	},
	{
		id: "needs-approval",
		label: "Needs approval",
		keywords: "needs approval pending review",
		icon: "alert-triangle",
		to: "/inbox/$mailboxId",
		filter: "needs_approval",
	},
];

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
	localStorage.setItem(
		RECENT_SEARCHES_KEY,
		JSON.stringify([trimmed, ...prev].slice(0, MAX_RECENT)),
	);
};

function formatThreadPrimary(thread: InboundThread): string {
	if (thread.direction === "outbound") {
		const tos = thread.toEmails ?? [];
		if (tos.length === 0) return "No recipients";
		return tos
			.map((addr) => {
				const { name, email } = parseEmail(addr);
				return name || email.split("@")[0] || email;
			})
			.join(", ");
	}
	return (
		thread.from.name || thread.from.email.split("@")[0] || thread.from.email
	);
}

function formatThreadTime(dateStr: string): string {
	const date = dayjs(dateStr);
	if (date.isSame(dayjs(), "day")) return date.format("h:mm A");
	if (date.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
	if (date.isAfter(dayjs().subtract(7, "day"))) return date.format("ddd");
	return date.format("MMM D");
}

export const InboxCommandPalette = ({
	open,
	onOpenChange,
	threads = [],
	onSelectThread,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Unfiltered (or folder-scoped) threads for jump search */
	threads?: InboundThread[];
	onSelectThread?: (id: string) => void;
}) => {
	const { openCompose } = useInboxSidebar();
	const navigate = useNavigate();
	const mailboxId = useMailboxId();
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [filterParam, setFilterParam] = useQueryState(
		"filter",
		parseAsString.withDefault(""),
	);

	const [draftQuery, setDraftQuery] = useState("");
	const [recentSearches, setRecentSearches] = useState<string[]>([]);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted ? resolvedTheme === "dark" : false;

	const activeFilters = useMemo(() => {
		return filterParam.split(",").filter(Boolean) as InboxFilterChip[];
	}, [filterParam]);

	useEffect(() => {
		if (!open) return;
		setDraftQuery(searchQuery);
		setRecentSearches(loadRecentSearches());
	}, [open, searchQuery]);

	const parsedDraft = useMemo(() => parseInboxQuery(draftQuery), [draftQuery]);

	const isTyping = draftQuery.trim().length >= 2;

	const messageResults = useMemo(() => {
		if (!isTyping) return [];
		return threads
			.filter((t) => threadMatchesQuery(t, parsedDraft))
			.slice(0, 8);
	}, [isTyping, threads, parsedDraft]);

	const toggleFilter = useCallback(
		(filter: InboxFilterChip) => {
			void setFilterParam(mergeFilterParam(filterParam, filter));
		},
		[filterParam, setFilterParam],
	);

	const clearAllFilters = useCallback(() => {
		void setSearchQuery(null);
		void setFilterParam(null);
		setDraftQuery("");
	}, [setSearchQuery, setFilterParam]);

	const applySearch = useCallback(
		(query: string, close = true) => {
			const parsed = parseInboxQuery(query);
			const textQ = serializeSearchText(parsed);
			void setSearchQuery(textQ || null);

			if (parsed.filters.length > 0) {
				const merged = new Set([...activeFilters, ...parsed.filters]);
				void setFilterParam(Array.from(merged).join(",") || null);
			}

			if (textQ || parsed.filters.length > 0) {
				saveRecentSearch(query.trim());
				setRecentSearches(loadRecentSearches());
			}
			if (close) onOpenChange(false);
		},
		[activeFilters, setSearchQuery, setFilterParam, onOpenChange],
	);

	const goToFolder = useCallback(
		(jump: FolderJump) => {
			if (!mailboxId) return;
			void navigate({ to: jump.to, params: { mailboxId } });
			if (jump.filter) {
				void setFilterParam(jump.filter);
			} else if (jump.id !== "needs-approval") {
				// Keep existing filters unless navigating to needs-approval shortcut
			}
			onOpenChange(false);
		},
		[mailboxId, navigate, setFilterParam, onOpenChange],
	);

	const runAndClose = useCallback(
		(fn: () => void) => {
			fn();
			onOpenChange(false);
		},
		[onOpenChange],
	);

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

	const qLower = draftQuery.trim().toLowerCase();

	const matchingFolders = useMemo(() => {
		if (!isTyping) return FOLDER_JUMPS;
		return FOLDER_JUMPS.filter(
			(f) =>
				f.label.toLowerCase().includes(qLower) ||
				f.keywords.includes(qLower) ||
				`go to ${f.label}`.toLowerCase().includes(qLower),
		);
	}, [isTyping, qLower]);

	const showComposeAction =
		!isTyping ||
		qLower.includes("compose") ||
		qLower.includes("new email") ||
		qLower.includes("write") ||
		"compose".startsWith(qLower);

	const showClearAction =
		(Boolean(searchQuery) || activeFilters.length > 0) &&
		(!isTyping ||
			qLower.includes("clear") ||
			qLower.includes("reset") ||
			"clear".startsWith(qLower));

	const operatorSuggestions = useMemo(() => {
		if (!isTyping) return [];
		const suggestions: { id: string; label: string; apply: string }[] = [];
		if (qLower.startsWith("from:") || "from:".startsWith(qLower)) {
			suggestions.push({
				id: "op-from",
				label: "from:someone@email.com",
				apply: draftQuery.includes(":") ? draftQuery : "from:",
			});
		}
		if (qLower.startsWith("to:") || "to:".startsWith(qLower)) {
			suggestions.push({
				id: "op-to",
				label: "to:someone@email.com",
				apply: draftQuery.includes(":") ? draftQuery : "to:",
			});
		}
		if (qLower.startsWith("subject:") || "subject:".startsWith(qLower)) {
			suggestions.push({
				id: "op-subject",
				label: "subject:meeting",
				apply: draftQuery.includes(":") ? draftQuery : "subject:",
			});
		}
		for (const chip of INBOX_FILTER_CHIPS) {
			if (
				chip.operator.startsWith(qLower) ||
				qLower.startsWith(chip.operator) ||
				chip.label.toLowerCase().includes(qLower)
			) {
				suggestions.push({
					id: `op-${chip.id}`,
					label: chip.operator,
					apply: chip.operator,
				});
			}
		}
		return suggestions.slice(0, 4);
	}, [isTyping, qLower, draftQuery]);

	return (
		<CommandMenu.Dialog
			open={open}
			onOpenChange={onOpenChange}
			overlayClassName="justify-start bg-black/35 pt-[16vh] backdrop-blur-[3px] dark:bg-black/60"
			className={cn(
				"inbox-zero-theme",
				isDark && "dark",
				// Single uniform Raycast surface — shrink-wrap to content, no dead bottom gap
				"flex h-auto max-h-[min(520px,72vh)] w-full max-w-[720px] flex-col overflow-hidden rounded-[14px] border p-0 text-mail-foreground",
				"border-black/[0.1] bg-[#F4F4F5]",
				"shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_24px_80px_rgba(0,0,0,0.18)]",
				"dark:border-white/[0.12] dark:bg-[#222222]",
				"dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.55)]",
				// cmdk defaults to CSS grid + flex-1 list which leaves empty space under the footer
				"[&_[cmdk-root]]:!flex [&_[cmdk-root]]:!h-auto [&_[cmdk-root]]:min-h-0 [&_[cmdk-root]]:flex-col [&_[cmdk-root]]:divide-y-0",
			)}
		>
			{/* Search — Raycast: large text, no leading icon, trailing hint */}
			<div className="group/cmd-input flex h-[52px] w-full shrink-0 items-center gap-3 border-black/[0.07] border-b px-5 dark:border-white/[0.08]">
				<CommandMenu.Input
					value={draftQuery}
					onValueChange={setDraftQuery}
					placeholder="Search for emails, filters, and actions…"
					className={paletteInputClass}
					onKeyDown={(e) => {
						if (e.key === "Enter" && draftQuery.trim()) {
							const selected = document.querySelector(
								"[cmdk-item][data-selected=true]",
							);
							if (!selected) {
								e.preventDefault();
								applySearch(draftQuery, true);
							}
						}
					}}
				/>
				{(activeFilters.length > 0 || searchQuery.trim()) && (
					<button
						type="button"
						onClick={clearAllFilters}
						className="shrink-0 text-[12px] text-mail-muted transition-colors hover:text-mail-foreground"
					>
						Clear
					</button>
				)}
			</div>

			<CommandMenu.List
				className={cn(
					// flex-1 + min-h-0: list grows to fill available space in the capped dialog
					"min-h-0 flex-1 overflow-y-auto px-2 pt-1 pb-1",
					"h-auto max-h-[min(420px,60vh)]",
					"bg-transparent",
					"[&>[cmdk-list-sizer]]:divide-y-0",
					"[&::-webkit-scrollbar]:w-1.5",
					"[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/10",
					"dark:[&::-webkit-scrollbar-thumb]:bg-white/15",
				)}
			>
				<CommandMenu.Empty className="px-4 py-10 text-center text-[13px] text-mail-muted">
					{isTyping ? "No results" : "Type to search"}
				</CommandMenu.Empty>

				{isTyping && messageResults.length > 0 && (
					<CommandMenu.Group heading="Emails" className={paletteGroupClass}>
						{messageResults.map((thread) => {
							const primary = formatThreadPrimary(thread);
							const avatarSource =
								thread.direction === "outbound"
									? parseEmail(thread.toEmails?.[0] ?? "")
									: {
											name: thread.from.name,
											email: thread.from.email,
										};
							const avatarEmail = avatarSource.email || thread.from.email;
							const avatarName = avatarSource.name || null;

							return (
								<CommandMenu.Item
									key={thread.id}
									value={`thread ${thread.subject} ${primary} ${thread.from.email}`}
									className={paletteItemClass}
									onSelect={() => {
										runAndClose(() => {
											onSelectThread?.(thread.id);
										});
									}}
								>
									<div
										className={cn(
											"flex size-6 shrink-0 items-center justify-center rounded-[6px] font-semibold text-[10px] text-white uppercase",
											getAvatarGradient(avatarEmail),
										)}
									>
										{getAvatarInitial(avatarName, avatarEmail)}
									</div>
									<ItemTitle
										title={thread.subject || "(No Subject)"}
										subtitle={primary}
									/>
									<ItemMeta>{formatThreadTime(thread.receivedAt)}</ItemMeta>
								</CommandMenu.Item>
							);
						})}
					</CommandMenu.Group>
				)}

				{isTyping && draftQuery.trim() && (
					<CommandMenu.Group heading="Search" className={paletteGroupClass}>
						<CommandMenu.Item
							value={`apply search ${draftQuery}`}
							className={paletteItemClass}
							onSelect={() => applySearch(draftQuery, true)}
						>
							<AppIcon name="search" />
							<ItemTitle title={`Search for “${draftQuery.trim()}”`} />
							<ItemMeta>Search</ItemMeta>
						</CommandMenu.Item>
					</CommandMenu.Group>
				)}

				{operatorSuggestions.length > 0 && (
					<CommandMenu.Group
						heading="Suggestions"
						className={paletteGroupClass}
					>
						{operatorSuggestions.map((op) => (
							<CommandMenu.Item
								key={op.id}
								value={`operator ${op.label}`}
								className={paletteItemClass}
								onSelect={() => {
									const chip = INBOX_FILTER_CHIPS.find(
										(c) => c.operator === op.apply,
									);
									if (chip) {
										toggleFilter(chip.id);
										setDraftQuery("");
										return;
									}
									setDraftQuery(
										op.apply.endsWith(":") ? op.apply : `${op.apply} `,
									);
								}}
							>
								<AppIcon name={operatorIcon(op.id, op.apply)} />
								<ItemTitle title={op.label} subtitle="Operator" />
								<ItemMeta>Filter</ItemMeta>
							</CommandMenu.Item>
						))}
					</CommandMenu.Group>
				)}

				{!isTyping && (
					<CommandMenu.Group
						heading="Suggestions"
						className={paletteGroupClass}
					>
						{INBOX_FILTER_CHIPS.map((chip) => {
							const active = activeFilters.includes(chip.id);
							return (
								<CommandMenu.Item
									key={chip.id}
									value={`filter ${chip.label} ${chip.operator}`}
									className={paletteItemClass}
									onSelect={() => toggleFilter(chip.id)}
								>
									<AppIcon name={FILTER_ICONS[chip.id]} />
									<ItemTitle title={chip.label} subtitle="Inbox" />
									<ItemMeta>
										{active ? (
											<span className="text-[#55B3FF]">On</span>
										) : (
											chip.operator
										)}
									</ItemMeta>
								</CommandMenu.Item>
							);
						})}
					</CommandMenu.Group>
				)}

				{(showComposeAction || showClearAction) && (
					<CommandMenu.Group heading="Commands" className={paletteGroupClass}>
						{showComposeAction && (
							<CommandMenu.Item
								value="compose new email"
								className={paletteItemClass}
								onSelect={() => runAndClose(openCompose)}
							>
								<AppIcon name="pencil" />
								<ItemTitle title="Compose Email" subtitle="Inbox" />
								<ItemMeta>Command</ItemMeta>
							</CommandMenu.Item>
						)}
						{showClearAction && (
							<CommandMenu.Item
								value="clear all filters"
								className={paletteItemClass}
								onSelect={() => {
									clearAllFilters();
									onOpenChange(false);
								}}
							>
								<AppIcon name="cross" />
								<ItemTitle title="Clear Filters" subtitle="Inbox" />
								<ItemMeta>Command</ItemMeta>
							</CommandMenu.Item>
						)}
					</CommandMenu.Group>
				)}

				{matchingFolders.length > 0 && (
					<CommandMenu.Group heading="Navigation" className={paletteGroupClass}>
						{matchingFolders.map((jump) => (
							<CommandMenu.Item
								key={jump.id}
								value={`go to ${jump.label} ${jump.keywords}`}
								className={paletteItemClass}
								onSelect={() => goToFolder(jump)}
							>
								<AppIcon name={jump.icon} />
								<ItemTitle title={`Go to ${jump.label}`} subtitle="Inbox" />
								<ItemMeta>Folder</ItemMeta>
							</CommandMenu.Item>
						))}
					</CommandMenu.Group>
				)}

				{!isTyping && recentSearches.length > 0 && (
					<CommandMenu.Group heading="Recent" className={paletteGroupClass}>
						{recentSearches.map((search) => (
							<CommandMenu.Item
								key={search}
								value={`recent ${search}`}
								className={paletteItemClass}
								onSelect={() => applySearch(search, true)}
							>
								<AppIcon name="clock" />
								<ItemTitle title={search} subtitle="Recent" />
								<ItemMeta>Search</ItemMeta>
							</CommandMenu.Item>
						))}
					</CommandMenu.Group>
				)}
			</CommandMenu.List>

			{/* Footer — logo left; labels then keycaps right (Raycast order) */}
			<div className="flex h-10 shrink-0 items-center gap-3 border-black/[0.07] border-t px-3.5 text-[12px] text-mail-muted dark:border-white/[0.08]">
				<Logo className="h-4 w-4 shrink-0 opacity-40" />
				<div className="ml-auto flex items-center gap-2.5">
					<span className="inline-flex items-center gap-1.5">
						<span>Open</span>
						<Keycap>↵</Keycap>
					</span>
					<span aria-hidden className="h-3 w-px bg-black/10 dark:bg-white/15" />
					<span className="inline-flex items-center gap-1.5">
						<span>Actions</span>
						<span className="inline-flex items-center gap-0.5">
							<Keycap>⌘</Keycap>
							<Keycap>K</Keycap>
						</span>
					</span>
				</div>
			</div>
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
		return "Search mail…";
	}, [searchQuery, filterLabels]);

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		void setSearchQuery(null);
		void setFilterParam(null);
	};

	const hasActive = Boolean(searchQuery.trim() || activeFilterCount > 0);

	return (
		<button
			type="button"
			onClick={onOpenPalette}
			className={cn(
				"relative flex h-10 w-full flex-1 select-none items-center justify-start overflow-hidden rounded-2xl border border-mail-border/40 bg-[var(--inbox-control)] pl-3 text-left font-normal text-mail-foreground text-sm shadow-none transition-colors",
				"hover:bg-[var(--inbox-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mail-foreground/15",
			)}
		>
			<Icon name="search" className="h-4 w-4 text-mail-muted" />
			<span
				className={cn(
					"ml-3 truncate pr-24",
					hasActive ? "text-mail-foreground" : "text-mail-muted",
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
				{hasActive && (
					<button
						type="button"
						onClick={handleClear}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleClear(e as unknown as React.MouseEvent);
							}
						}}
						className="inline-flex h-6 items-center rounded-md border border-mail-border/40 bg-panel-light px-2 font-medium text-mail-foreground text-xs transition-colors hover:bg-[var(--inbox-control-hover)] dark:bg-panel-dark"
					>
						Clear
					</button>
				)}
				<span className="pointer-events-none hidden items-center gap-0.5 sm:inline-flex">
					<KbdCommand className="h-3.5 w-3.5 border-mail-border/50 bg-transparent p-0 text-mail-muted" />
					<KbdKey className="h-3.5 w-3.5 border-mail-border/50 bg-transparent p-0 text-[9px] text-mail-muted">
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
