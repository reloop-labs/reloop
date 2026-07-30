import { useRouter } from "next/navigation";
import { useSignOut } from "#/features/auth/session-query";
import {
	filterSettingsNavigation,
	mainNavigation,
	settingsNavigation,
} from "#/features/dashboard/navigation";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { cn } from "@reloop/ui/cn";
import * as CommandMenu from "@reloop/ui/command";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";

import {
	ArrowDown,
	ArrowUp,
	Clock,
	CornerDownLeft,
	Search,
	X,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";

const RECENT_ITEMS_KEY = "reloop-cmd-recents";
const MAX_RECENTS = 5;

const PAGE_SHORTCUTS: Record<string, { label: string; keys: string[] }> = {};
mainNavigation.slice(0, 9).forEach((item, i) => {
	PAGE_SHORTCUTS[item.path] = {
		label: `⌘${i + 1}`,
		keys: [`mod+${i + 1}`],
	};
});

interface RecentItem {
	path: string;
	label: string;
	iconName: string;
	timestamp: number;
}

interface CommandAction {
	id: string;
	label: string;
	icon: string;
	shortcut?: { label: string; keys: string[] };
	onSelect: () => void;
	variant?: "default" | "danger";
}

function getRecents(): RecentItem[] {
	try {
		const raw = localStorage.getItem(RECENT_ITEMS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function addRecent(item: Omit<RecentItem, "timestamp">) {
	try {
		const recents = getRecents().filter((r) => r.path !== item.path);
		recents.unshift({ ...item, timestamp: Date.now() });
		localStorage.setItem(
			RECENT_ITEMS_KEY,
			JSON.stringify(recents.slice(0, MAX_RECENTS)),
		);
	} catch {
		// ignore
	}
}

function KbdBadge({ label }: { label: string }) {
	const parts = label.match(/([⌘⇧⌃⌥]+|[A-Z0-9↵⎋⇥])/g) ?? [label];
	return (
		<span className="ml-auto flex shrink-0 items-center gap-0.5">
			{parts.map((part, i) => (
				<KbdKeyOutline
					key={`${part}-${i}`}
					className="h-[18px] w-auto min-w-[18px] px-1 font-sans text-[10px] text-text-soft-400"
				>
					{part}
				</KbdKeyOutline>
			))}
		</span>
	);
}

export function CommandMenuGlobal() {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const router = useRouter();
	const signOut = useSignOut();
	const { setTheme, resolvedTheme } = useTheme();
	const inputRef = React.useRef<HTMLInputElement>(null);
	const { isOrgAdmin, canManageTeam } = useOrgPermissions();
	const settingsItems = React.useMemo(
		() =>
			filterSettingsNavigation(settingsNavigation, {
				isOrgAdmin,
				canManageTeam,
			}).flatMap((section) => section.items),
		[isOrgAdmin, canManageTeam],
	);	useHotkeys("mod+k", (e) => {
		e.preventDefault();
		setOpen((o) => !o);
	});

	useHotkeys("mod+shift+l", (e) => {
		e.preventDefault();
		setTheme(resolvedTheme === "light" ? "dark" : "light");
	});

	const navigateTo = React.useCallback(
		(item: { path: string; label: string; iconName: string }) => {
			if (!item.path) return;
			addRecent({
				path: item.path,
				label: item.label,
				iconName: item.iconName,
			});
			// Paths come from mainNavigation / settingsNavigation route table.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			router.push(item.path as any);
			setOpen(false);
		},
		[router],
	);

	useHotkeys(
		"mod+1,mod+2,mod+3,mod+4,mod+5,mod+6,mod+7,mod+8,mod+9",
		(e, handler) => {
			if (!open) return;
			e.preventDefault();
			const keyStr =
				typeof handler.keys === "string"
					? handler.keys
					: Array.isArray(handler.keys)
						? handler.keys.join("")
						: "";
			const num = Number.parseInt(keyStr.replace(/[^0-9]/g, ""), 10);
			if (num >= 1 && num <= mainNavigation.length) {
				const item = mainNavigation[num - 1];
				if (item) navigateTo(item);
			}
		},
		{ enabled: open, enableOnFormTags: true },
	);

	React.useEffect(() => {
		if (open) {
			setSearch("");
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [open]);

	const handleThemeSelect = React.useCallback(
		(themeValue: string) => {
			if (themeValue === "toggle") {
				setTheme(resolvedTheme === "light" ? "dark" : "light");
			} else {
				setTheme(themeValue);
			}
			setOpen(false);
		},
		[setTheme, resolvedTheme],
	);

	const handleSignOut = React.useCallback(async () => {
		setOpen(false);
		await signOut();
	}, [signOut]);

	const recents = React.useMemo(() => (open ? getRecents() : []), [open]);

	const appearanceActions: CommandAction[] = React.useMemo(
		() => [
			{
				id: "toggle-theme",
				label: "Toggle Theme",
				icon: resolvedTheme === "dark" ? "sun" : "moon",
				shortcut: { label: "⌘⇧L", keys: ["mod+shift+l"] },
				onSelect: () => handleThemeSelect("toggle"),
			},
			{
				id: "light-theme",
				label: "Light Mode",
				icon: "sun",
				onSelect: () => handleThemeSelect("light"),
			},
			{
				id: "dark-theme",
				label: "Dark Mode",
				icon: "moon",
				onSelect: () => handleThemeSelect("dark"),
			},
			{
				id: "system-theme",
				label: "System Theme",
				icon: "monitor",
				onSelect: () => handleThemeSelect("system"),
			},
		],
		[resolvedTheme, handleThemeSelect],
	);

	const quickActions: CommandAction[] = React.useMemo(
		() => [
			{
				id: "sign-out",
				label: "Sign Out",
				icon: "arrow-right-rec",
				variant: "danger" as const,
				onSelect: () => {
					void handleSignOut();
				},
			},
		],
		[handleSignOut],
	);

	const hasSearch = search.trim().length > 0;

	return (
		<CommandMenu.Dialog
			open={open}
			onOpenChange={setOpen}
			className="max-h-[min(520px,80vh)]"
		>
			<div className="group/cmd-input flex h-12 w-full items-center gap-2.5 bg-bg-white-0 px-4">
				<Search
					className={cn(
						"size-4 shrink-0 text-text-soft-400",
						"transition duration-150 ease-out",
						"group-focus-within/cmd-input:text-text-sub-600",
					)}
				/>
				<CommandMenu.Input
					ref={inputRef}
					value={search}
					onValueChange={setSearch}
					placeholder="Search pages, commands, actions..."
				/>
				{search ? (
					<button
						type="button"
						onClick={() => setSearch("")}
						className="flex size-5 shrink-0 items-center justify-center rounded text-text-soft-400 transition-colors hover:text-text-sub-600"
					>
						<X className="size-3.5" />
					</button>
				) : null}
				<span className="ml-1 flex shrink-0 items-center gap-0.5">
					<KbdKeyOutline className="h-5 w-auto px-1 font-sans text-[10px]">
						<span className="text-[10px]">⌘</span>
					</KbdKeyOutline>
					<KbdKeyOutline className="h-5 w-auto px-1 font-sans text-[10px]">
						K
					</KbdKeyOutline>
				</span>
			</div>

			<CommandMenu.List>
				<CommandMenu.Empty>
					<div className="flex flex-col items-center gap-2 px-6">
						<Search className="size-8 text-text-disabled-300" />
						<p className="text-label-sm text-text-sub-600">No results found</p>
						<p className="text-paragraph-xs text-text-soft-400">
							Try searching for a page, command, or action
						</p>
					</div>
				</CommandMenu.Empty>

				{!hasSearch && recents.length > 0 ? (
					<CommandMenu.Group heading="Recent">
						{recents.map((item) => {
							const shortcut = PAGE_SHORTCUTS[item.path];
							return (
								<CommandMenu.Item
									key={`recent-${item.path}`}
									value={`recent ${item.label}`}
									onSelect={() =>
										navigateTo({
											path: item.path,
											label: item.label,
											iconName: item.iconName,
										})
									}
								>
									<CommandMenu.ItemIcon
										as={Clock}
										className="size-4 text-text-soft-400"
									/>
									<span className="flex-1 truncate">{item.label}</span>
									{shortcut ? <KbdBadge label={shortcut.label} /> : null}
								</CommandMenu.Item>
							);
						})}
					</CommandMenu.Group>
				) : null}

				<CommandMenu.Group heading="Pages">
					{mainNavigation.map((item) => {
						const shortcut = PAGE_SHORTCUTS[item.path];
						return (
							<CommandMenu.Item
								key={item.path}
								value={item.label}
								onSelect={() => navigateTo(item)}
							>
								<CommandMenu.ItemIcon
									as={Icon}
									name={item.iconName}
									className="size-4"
								/>
								<span className="flex-1 truncate">{item.label}</span>
								{shortcut ? <KbdBadge label={shortcut.label} /> : null}
							</CommandMenu.Item>
						);
					})}
				</CommandMenu.Group>

				<CommandMenu.Group heading="Settings">
					{settingsItems.map((item) => (
						<CommandMenu.Item
							key={`settings-${item.path}`}
							value={`Settings ${item.label}`}
							onSelect={() => navigateTo(item)}
						>
							<CommandMenu.ItemIcon
								as={Icon}
								name={item.iconName}
								className="size-4"
							/>
							<span className="flex-1 truncate">{item.label}</span>
						</CommandMenu.Item>
					))}
				</CommandMenu.Group>

				<CommandMenu.Group heading="Appearance">
					{appearanceActions.map((action) => (
						<CommandMenu.Item
							key={action.id}
							value={`Appearance ${action.label}`}
							onSelect={action.onSelect}
						>
							<CommandMenu.ItemIcon
								as={Icon}
								name={action.icon}
								className="size-4"
							/>
							<span className="flex-1 truncate">{action.label}</span>
							{action.shortcut ? (
								<KbdBadge label={action.shortcut.label} />
							) : null}
						</CommandMenu.Item>
					))}
				</CommandMenu.Group>

				<CommandMenu.Group heading="Actions">
					{quickActions.map((action) => (
						<CommandMenu.Item
							key={action.id}
							value={`Action ${action.label}`}
							onSelect={action.onSelect}
							className={cn(
								action.variant === "danger" &&
									"text-error-base data-[selected=true]:bg-red-alpha-10",
							)}
						>
							<CommandMenu.ItemIcon
								as={Icon}
								name={action.icon}
								className={cn(
									"size-4",
									action.variant === "danger" && "text-error-base",
								)}
							/>
							<span className="flex-1 truncate">{action.label}</span>
						</CommandMenu.Item>
					))}
				</CommandMenu.Group>
			</CommandMenu.List>

			<CommandMenu.Footer className="border-stroke-soft-200 border-t">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5">
						<CommandMenu.FooterKeyBox>
							<ArrowUp className="size-3" />
						</CommandMenu.FooterKeyBox>
						<CommandMenu.FooterKeyBox>
							<ArrowDown className="size-3" />
						</CommandMenu.FooterKeyBox>
						<span className="text-[11px] text-text-soft-400">Navigate</span>
					</div>
					<div className="flex items-center gap-1.5">
						<CommandMenu.FooterKeyBox>
							<CornerDownLeft className="size-3" />
						</CommandMenu.FooterKeyBox>
						<span className="text-[11px] text-text-soft-400">Open</span>
					</div>
					<div className="flex items-center gap-1.5">
						<CommandMenu.FooterKeyBox>
							<span className="font-medium text-[9px]">esc</span>
						</CommandMenu.FooterKeyBox>
						<span className="text-[11px] text-text-soft-400">Close</span>
					</div>
				</div>
				<div className="text-[11px] text-text-disabled-300">Reloop Command</div>
			</CommandMenu.Footer>
		</CommandMenu.Dialog>
	);
}
