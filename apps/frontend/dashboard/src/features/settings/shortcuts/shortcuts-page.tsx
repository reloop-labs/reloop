"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useMemo, useState } from "react";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import {
	mainNavigation,
	settingsNavigation,
} from "#/features/dashboard/navigation";
import { SidebarNavIcon } from "#/features/dashboard/sidebar/sidebar-nav-icon";

type ShortcutCategory = "app" | "navigation" | "developer" | "settings";

interface ShortcutItem {
	name: string;
	/** One group per chord/step. Sequence shortcuts have multiple groups. */
	keyGroups: string[][];
	iconName: string;
	isSequence?: boolean;
	/** Prefix keycaps with a plain “Hold” label (e.g. hold Space). */
	holdPrefix?: boolean;
	category: ShortcutCategory;
}

interface ShortcutCategoryGroup {
	id: ShortcutCategory;
	title: string;
	description: string;
	shortcuts: ShortcutItem[];
}

const MODIFIER_MAP: Record<string, string> = {
	cmd: "⌘",
	command: "⌘",
	meta: "⌘",
	mod: "⌘",
	ctrl: "⌃",
	control: "⌃",
	alt: "⌥",
	option: "⌥",
	opt: "⌥",
	shift: "⇧",
	"⇧": "⇧",
	"⌘": "⌘",
	"⌃": "⌃",
	"⌥": "⌥",
};

/** Normalize a single key token (e.g. "Shift", "shift+t", "G") into display tokens. */
function normalizeKeyToken(token: string): string[] {
	const trimmed = token.trim();
	if (!trimmed) return [];

	// Already a symbol
	if (/^[⌘⇧⌃⌥]$/.test(trimmed)) return [trimmed];

	// Chord like "Shift+T" or "mod+shift+l"
	if (trimmed.includes("+")) {
		return trimmed
			.split("+")
			.flatMap((part) => normalizeKeyToken(part))
			.filter(Boolean);
	}

	const lower = trimmed.toLowerCase();
	if (MODIFIER_MAP[lower]) return [MODIFIER_MAP[lower]];

	// Single letter / number / punctuation — uppercase for consistency
	if (trimmed.length === 1) return [trimmed.toUpperCase()];

	// Multi-char labels (Space, Hold, Escape, …) — title case
	return [trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()];
}

/**
 * Parse a shortcut label into key groups.
 * - Sequence labels like "G E" / "G Shift+T" → [["G"], ["E"]] / [["G"], ["⇧", "T"]]
 * - Chord labels like "⌘⇧L" or "⌘ ⇧ L" → [["⌘", "⇧", "L"]]
 */
function parseKeyGroups(label: string, isSequence?: boolean): string[][] {
	const parts = label.trim().split(/\s+/).filter(Boolean);

	if (isSequence) {
		return parts.map((part) => normalizeKeyToken(part));
	}

	// Chord: flatten everything into one group
	const flat = parts.flatMap((part) => {
		// Compact chord without spaces: "⌘⇧L" or "⌘⇧C"
		const compact = part.match(/([⌘⇧⌃⌥]|[^\s⌘⇧⌃⌥]+)/g);
		if (compact && compact.length > 1) {
			return compact.flatMap((t) => normalizeKeyToken(t));
		}
		return normalizeKeyToken(part);
	});

	return flat.length > 0 ? [flat] : [];
}

function ShortcutKeycaps({
	keyGroups,
	isSequence,
	holdPrefix,
}: {
	keyGroups: string[][];
	isSequence?: boolean;
	holdPrefix?: boolean;
}) {
	return (
		<div
			className="flex shrink-0 select-none items-center gap-1"
			aria-hidden="true"
		>
			{holdPrefix ? (
				<span className="pr-0.5 font-normal text-[10px] text-text-soft-400 dark:text-white/40">
					Hold
				</span>
			) : null}
			{keyGroups.map((group, gi) => (
				<div key={`g-${gi}`} className="flex items-center gap-1">
					{gi > 0 && isSequence ? (
						<span className="px-0.5 font-normal text-[10px] text-text-soft-400 dark:text-white/40">
							then
						</span>
					) : null}
					<div className="flex items-center gap-0.5">
						{group.map((key, ki) => (
							<ActionKbd
								key={`${key}-${ki}`}
								className={cn(
									"w-auto min-w-4 px-1",
									// Wider face for multi-char labels (Space, Esc, …)
									key.length > 1 && "px-1.5",
								)}
							>
								{key}
							</ActionKbd>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function ShortcutsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const appShortcuts: ShortcutItem[] = useMemo(
		() => [
			{
				name: "Open command menu",
				keyGroups: parseKeyGroups("⌘K"),
				iconName: "command",
				category: "app",
			},
			{
				name: "Toggle left sidebar",
				keyGroups: parseKeyGroups("⌘B"),
				iconName: "sidebar-left",
				category: "app",
			},
			{
				name: "Toggle theme mode",
				keyGroups: [["T"]],
				iconName: "swatch-book",
				category: "app",
			},
			{
				name: "Copy current URL",
				keyGroups: parseKeyGroups("⌘⇧C"),
				iconName: "link",
				category: "app",
			},
			{
				name: "Reveal in-context shortcut hints",
				keyGroups: [["Space"]],
				iconName: "keyboard",
				holdPrefix: true,
				category: "app",
			},
		],
		[],
	);

	const navigationShortcuts: ShortcutItem[] = useMemo(() => {
		const list: ShortcutItem[] = [];
		for (const item of mainNavigation) {
			if (item.section === "Developer" || item.section === "Settings") continue;
			if (item.shortcut) {
				list.push({
					name: item.label,
					keyGroups: parseKeyGroups(item.shortcut.label, true),
					iconName: item.iconName,
					isSequence: true,
					category: "navigation",
				});
			}
			for (const sub of item.items ?? []) {
				if (!sub.shortcut) continue;
				list.push({
					name: sub.label,
					keyGroups: parseKeyGroups(sub.shortcut.label, true),
					iconName: sub.iconName,
					isSequence: true,
					category: "navigation",
				});
			}
		}
		return list;
	}, []);

	const developerShortcuts: ShortcutItem[] = useMemo(() => {
		const list: ShortcutItem[] = [];
		for (const item of mainNavigation) {
			if (item.section !== "Developer") continue;
			if (!item.shortcut) continue;
			list.push({
				name: item.label,
				keyGroups: parseKeyGroups(item.shortcut.label, true),
				iconName: item.iconName,
				isSequence: true,
				category: "developer",
			});
		}
		return list;
	}, []);

	const settingsShortcuts: ShortcutItem[] = useMemo(() => {
		const list: ShortcutItem[] = [];
		// Top-level Settings entry from main nav (G ,)
		const settingsRoot = mainNavigation.find((i) => i.section === "Settings");
		if (settingsRoot?.shortcut) {
			list.push({
				name: settingsRoot.label,
				keyGroups: parseKeyGroups(settingsRoot.shortcut.label, true),
				iconName: settingsRoot.iconName,
				isSequence: true,
				category: "settings",
			});
		}
		for (const section of settingsNavigation) {
			for (const item of section.items) {
				if (!item.shortcut) continue;
				list.push({
					name: item.label,
					keyGroups: parseKeyGroups(item.shortcut.label, true),
					iconName: item.iconName,
					isSequence: true,
					category: "settings",
				});
			}
		}
		return list;
	}, []);

	const allCategoryGroups: ShortcutCategoryGroup[] = useMemo(
		() => [
			{
				id: "app",
				title: "App & general",
				description: "Global hotkeys available anywhere in the dashboard.",
				shortcuts: appShortcuts,
			},
			{
				id: "navigation",
				title: "Navigation",
				description: "Press G, then a letter to jump to a page.",
				shortcuts: navigationShortcuts,
			},
			{
				id: "developer",
				title: "Developer",
				description: "Sequences for API keys, domains, webhooks, and more.",
				shortcuts: developerShortcuts,
			},
			{
				id: "settings",
				title: "Settings",
				description: "Jump into account and workspace settings.",
				shortcuts: settingsShortcuts,
			},
		],
		[
			appShortcuts,
			navigationShortcuts,
			developerShortcuts,
			settingsShortcuts,
		],
	);

	const filteredGroups = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		return allCategoryGroups
			.map((group) => {
				const matches = group.shortcuts.filter((sc) => {
					if (!query) return true;
					const keysText = sc.keyGroups.flat().join(" ");
					return `${sc.name} ${keysText}`.toLowerCase().includes(query);
				});
				return { ...group, shortcuts: matches };
			})
			.filter((group) => group.shortcuts.length > 0);
	}, [searchQuery, allCategoryGroups]);

	const totalCount = allCategoryGroups.reduce(
		(n, g) => n + g.shortcuts.length,
		0,
	);

	return (
		<div className="w-full max-w-3xl space-y-6 pt-5 pb-16">
			{/* Header */}
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
					Keyboard Shortcuts
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
					Hotkeys and sequences to navigate Reloop without leaving the keyboard.
				</p>
			</div>

			{/* Tip */}
			<div className="flex items-start gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/40 px-4 py-3.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
					<Icon
						name="keyboard"
						className="size-4 text-text-sub-600 dark:text-white/70"
					/>
				</div>
				<div className="min-w-0 flex-1 pt-0.5">
					<p className="font-medium text-label-sm text-text-strong-950 dark:text-white">
						In-context hints
					</p>
					<p className="mt-0.5 text-paragraph-xs text-text-sub-600 dark:text-white/60">
						Hold{" "}
						<ActionKbd className="mx-0.5 inline-flex w-auto min-w-4 translate-y-px px-1.5">
							Space
						</ActionKbd>{" "}
						to reveal shortcut badges on buttons and actions around the app.
					</p>
				</div>
			</div>

			{/* Search */}
			<div className="w-full max-w-md">
				<Input.Root size="small" className="rounded-xl">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							placeholder="Search shortcuts…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							aria-label="Search shortcuts"
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			{/* Groups */}
			{filteredGroups.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stroke-soft-200 px-6 py-14 text-center dark:border-white/10">
					<div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
						<Icon
							name="search"
							className="size-4 text-text-soft-400 dark:text-white/40"
						/>
					</div>
					<p className="font-medium text-paragraph-sm text-text-strong-950 dark:text-white">
						No shortcuts found
					</p>
					<p className="mt-1 max-w-xs text-paragraph-xs text-text-soft-400">
						Try a different keyword, or clear filters to browse all {totalCount}{" "}
						shortcuts.
					</p>
					{searchQuery ? (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="mt-4 rounded-lg bg-bg-weak-50 px-3 py-1.5 font-medium text-paragraph-xs text-text-sub-600 transition-colors hover:text-text-strong-950 dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
						>
							Clear search
						</button>
					) : null}
				</div>
			) : (
				<div className="space-y-8">
					{filteredGroups.map((group) => (
						<section key={group.id} className="space-y-3">
							<div>
								<h2 className="font-medium text-label-md text-text-strong-950 dark:text-white">
									{group.title}
								</h2>
								<p className="mt-0.5 text-paragraph-xs text-text-sub-600 dark:text-white/55">
									{group.description}
								</p>
							</div>

							{/* 2-column grid */}
							<ul className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
								{group.shortcuts.map((sc, index) => (
									<li
										key={`${group.id}-${sc.name}-${index}`}
										className={cn(
											"flex items-center justify-between gap-3 border-stroke-soft-100 border-b px-1 py-2.5 dark:border-white/5",
											"transition-colors duration-150 ease-out",
											"hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]",
										)}
									>
										<div className="flex min-w-0 items-center gap-2.5 pr-2">
											<SidebarNavIcon
												name={sc.iconName}
												className="size-4 shrink-0 text-text-sub-600 opacity-80 dark:text-white/70"
											/>
											<span className="truncate font-medium text-paragraph-xs text-text-sub-600 dark:text-white/80">
												{sc.name}
											</span>
										</div>
										<ShortcutKeycaps
											keyGroups={sc.keyGroups}
											isSequence={sc.isSequence}
											holdPrefix={sc.holdPrefix}
										/>
									</li>
								))}
							</ul>
						</section>
					))}
				</div>
			)}
		</div>
	);
}
