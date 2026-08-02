import { cn } from "@reloop/ui/cn";
import * as CommandMenu from "@reloop/ui/command";
import { Icon } from "@reloop/ui/icon";
import {
	ArrowDown,
	ArrowLeft,
	ArrowUp,
	Check,
	ChevronRight,
	CornerDownLeft,
	Search,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useCommandMenuActions } from "#/features/dashboard/command-menu-context";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import {
	filterSettingsNavigation,
	mainNavigation,
	settingsNavigation,
} from "#/features/dashboard/navigation";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";

const PAGE_SHORTCUTS: Record<string, { label: string; keys: string[] }> = {};
mainNavigation.forEach((item, i) => {
	if (i < 9) {
		PAGE_SHORTCUTS[item.path] = {
			label: `⌘${i + 1}`,
			keys: [`mod+${i + 1}`],
		};
	} else if (item.path === "/settings") {
		PAGE_SHORTCUTS[item.path] = {
			label: "⌘,",
			keys: ["mod+,"],
		};
	}
});

export interface CommandAction {
	id: string;
	label: string;
	icon: string;
	shortcut?: { label: string; keys: string[] };
	onSelect: () => void;
	variant?: "default" | "danger";
}

function KbdBadge({ label }: { label: string }) {
	const parts = label.match(/([⌘⇧⌃⌥]+|[A-Z0-9↵⎋⇥])/g) ?? [label];
	return (
		<span className="ml-auto flex shrink-0 items-center gap-1">
			{parts.map((part, i) => (
				<ActionKbd key={`${part}-${i}`} className="w-auto min-w-4 px-1">
					{part}
				</ActionKbd>
			))}
		</span>
	);
}

export function CommandMenuGlobal() {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [view, setView] = React.useState<"root" | "organizations">("root");
	const router = useRouter();
	const { setTheme, resolvedTheme } = useTheme();
	const inputRef = React.useRef<HTMLInputElement>(null);
	const { isOrgAdmin, canManageTeam } = useOrgPermissions();
	const { activeOrganization, organizations, onOrganizationChange } =
		useActiveOrganization();

	const settingsItems = React.useMemo(
		() =>
			filterSettingsNavigation(settingsNavigation, {
				isOrgAdmin,
				canManageTeam,
			}).flatMap((section) => section.items),
		[isOrgAdmin, canManageTeam],
	);
	useHotkeys("mod+k", (e) => {
		e.preventDefault();
		setOpen((o) => !o);
	});

	useHotkeys("mod+shift+l", (e) => {
		e.preventDefault();
		setTheme(resolvedTheme === "light" ? "dark" : "light");
	});

	const handleCopyUrl = React.useCallback(() => {
		if (typeof window !== "undefined") {
			void navigator.clipboard.writeText(window.location.href);
			toast.success("URL copied to clipboard");
		}
		setOpen(false);
	}, []);

	useHotkeys("mod+shift+c", (e) => {
		e.preventDefault();
		handleCopyUrl();
	});

	const handleCopyOrgId = React.useCallback(() => {
		if (activeOrganization?.id) {
			void navigator.clipboard.writeText(activeOrganization.id);
			toast.success("Organization ID copied to clipboard");
		}
		setOpen(false);
	}, [activeOrganization?.id]);

	const handleCreateOrg = React.useCallback(() => {
		setOpen(false);
		router.push("/onboarding");
	}, [router]);

	const handleSwitchOrg = React.useCallback(
		(org: NonNullable<typeof organizations>[number]) => {
			setOpen(false);
			void onOrganizationChange(org);
		},
		[onOrganizationChange],
	);

	const navigateTo = React.useCallback(
		(item: { path: string; label: string; iconName: string }) => {
			if (!item.path) return;
			// Paths come from mainNavigation / settingsNavigation route table.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			router.push(item.path as any);
			setOpen(false);
		},
		[router],
	);

	useHotkeys("mod+,", (e) => {
		e.preventDefault();
		router.push("/settings");
		setOpen(false);
	});

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
			setView("root");
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [open]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (view !== "root" && e.key === "Backspace" && search === "") {
			e.preventDefault();
			setView("root");
		}
	};

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

	const pageActionGroups = useCommandMenuActions();

	return (
		<CommandMenu.Dialog
			open={open}
			onOpenChange={setOpen}
			className="max-h-[min(400px,54vh)]"
		>
			<div className="group/cmd-input flex h-13 w-full items-center gap-3 border-stroke-soft-200 border-b bg-bg-white-0 px-4 dark:border-white/10">
				{view === "root" ? (
					<Search
						className={cn(
							"size-3.5 shrink-0 text-text-soft-400",
							"transition duration-150 ease-out",
							"group-focus-within/cmd-input:text-text-sub-600",
						)}
					/>
				) : (
					<button
						type="button"
						onClick={() => {
							setView("root");
							setSearch("");
						}}
						className="cursor-pointer shrink-0"
						aria-label="Back to main menu"
					>
						<ActionKbd className="w-auto min-w-4 px-1">
							<ArrowLeft className="size-3" />
						</ActionKbd>
					</button>
				)}
				<CommandMenu.Input
					ref={inputRef}
					value={search}
					onValueChange={setSearch}
					onKeyDown={handleKeyDown}
					placeholder={
						view === "organizations"
							? "Search organizations..."
							: "Search pages and actions..."
					}
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

				{view === "organizations" ? (
					<CommandMenu.Group heading="Organizations">
						{(organizations ?? []).map((org) => {
							const isActive = org.id === activeOrganization?.id;
							return (
								<CommandMenu.Item
									key={`org-sub-${org.id}`}
									value={`Organization ${org.name}`}
									onSelect={() => handleSwitchOrg(org)}
								>
									<CommandMenu.ItemIcon
										as={Icon}
										name="workspace-custom"
										className="size-3.5"
									/>
									<span className="flex-1 truncate font-medium">
										{org.name}
									</span>
									{isActive ? (
										<Check className="size-3.5 shrink-0 text-text-strong-950 dark:text-white" />
									) : null}
								</CommandMenu.Item>
							);
						})}
					</CommandMenu.Group>
				) : (
					<>
						{/* Page-specific actions — only shown when on the relevant page */}
						{pageActionGroups.map((group) => (
							<CommandMenu.Group key={group.heading} heading={group.heading}>
								{group.actions.map((action) => (
									<CommandMenu.Item
										key={action.id}
										value={`${group.heading} ${action.label}`}
										onSelect={() => {
											setOpen(false);
											action.onSelect();
										}}
									>
										<CommandMenu.ItemIcon
											as={Icon}
											name={action.icon}
											className="size-3.5"
										/>
										<span className="flex-1 truncate">{action.label}</span>
										{action.shortcut ? (
											<KbdBadge label={action.shortcut.label} />
										) : null}
									</CommandMenu.Item>
								))}
							</CommandMenu.Group>
						))}

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
											className="size-3.5"
										/>
										<span className="flex-1 truncate">{item.label}</span>
										{shortcut ? <KbdBadge label={shortcut.label} /> : null}
									</CommandMenu.Item>
								);
							})}
						</CommandMenu.Group>

						<CommandMenu.Group heading="Organization">
							<CommandMenu.Item
								value="Organization Switch Organization Team Workspace"
								onSelect={() => {
									setView("organizations");
									setSearch("");
								}}
							>
								<CommandMenu.ItemIcon
									as={Icon}
									name="arrow-swap"
									className="size-3.5"
								/>
								<span className="flex-1 truncate">Switch Organization</span>
								<ChevronRight className="size-3.5 text-text-soft-400" />
							</CommandMenu.Item>

							{activeOrganization?.id ? (
								<CommandMenu.Item
									value="Organization Copy Organization ID"
									onSelect={handleCopyOrgId}
								>
									<CommandMenu.ItemIcon
										as={Icon}
										name="copy"
										className="size-3.5"
									/>
									<span className="flex-1 truncate">Copy Organization ID</span>
								</CommandMenu.Item>
							) : null}

							<CommandMenu.Item
								value="Organization Create New Organization Workspace"
								onSelect={handleCreateOrg}
							>
								<CommandMenu.ItemIcon
									as={Icon}
									name="plus"
									className="size-3.5"
								/>
								<span className="flex-1 truncate">Create New Organization</span>
							</CommandMenu.Item>
						</CommandMenu.Group>

						<CommandMenu.Group heading="Settings">
							{settingsItems.map((item) => {
								const shortcut = PAGE_SHORTCUTS[item.path];
								return (
									<CommandMenu.Item
										key={`settings-${item.path}`}
										value={`Settings ${item.label}`}
										onSelect={() => navigateTo(item)}
									>
										<CommandMenu.ItemIcon
											as={Icon}
											name={item.iconName}
											className="size-3.5"
										/>
										<span className="flex-1 truncate">{item.label}</span>
										{shortcut ? <KbdBadge label={shortcut.label} /> : null}
									</CommandMenu.Item>
								);
							})}
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
										className="size-3.5"
									/>
									<span className="flex-1 truncate">{action.label}</span>
									{action.shortcut ? (
										<KbdBadge label={action.shortcut.label} />
									) : null}
								</CommandMenu.Item>
							))}
						</CommandMenu.Group>

						<CommandMenu.Group heading="Actions">
							<CommandMenu.Item
								value="Actions Copy Current URL"
								onSelect={handleCopyUrl}
							>
								<CommandMenu.ItemIcon
									as={Icon}
									name="link"
									className="size-3.5"
								/>
								<span className="flex-1 truncate">Copy Current URL</span>
								<KbdBadge label="⌘⇧C" />
							</CommandMenu.Item>
						</CommandMenu.Group>
					</>
				)}
			</CommandMenu.List>

			<CommandMenu.Footer className="justify-between">
				{view === "root" ? (
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1.5">
							<ActionKbd className="w-auto min-w-4 px-1">
								<ArrowUp className="size-3" />
							</ActionKbd>
							<ActionKbd className="w-auto min-w-4 px-1">
								<ArrowDown className="size-3" />
							</ActionKbd>
							<span className="text-[11px] text-text-soft-400">Navigate</span>
						</div>
						<div className="flex items-center gap-1.5">
							<ActionKbd className="w-auto min-w-4 px-1">
								<CornerDownLeft className="size-3" />
							</ActionKbd>
							<span className="text-[11px] text-text-soft-400">Open</span>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1.5">
							<ActionKbd className="w-auto min-w-4 px-1">
								<ArrowLeft className="size-3" />
							</ActionKbd>
							<span className="text-[11px] text-text-soft-400">Back</span>
						</div>
						<div className="flex items-center gap-1.5">
							<ActionKbd className="w-auto min-w-4 px-1">
								<CornerDownLeft className="size-3" />
							</ActionKbd>
							<span className="text-[11px] text-text-soft-400">Select</span>
						</div>
					</div>
				)}
				<div className="flex items-center gap-1.5">
					<ActionKbd className="lowercase! w-auto min-w-0 px-1 font-sans text-[10px]">
						esc
					</ActionKbd>
					<span className="text-[11px] text-text-soft-400">Close</span>
				</div>
			</CommandMenu.Footer>
		</CommandMenu.Dialog>
	);
}
