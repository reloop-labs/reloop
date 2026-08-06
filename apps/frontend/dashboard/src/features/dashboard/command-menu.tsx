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
mainNavigation.forEach((item) => {
	if (item.shortcut) {
		PAGE_SHORTCUTS[item.path] = item.shortcut;
	}
	item.items?.forEach((sub) => {
		if (sub.shortcut) {
			PAGE_SHORTCUTS[sub.path] = sub.shortcut;
		}
	});
});
settingsNavigation.forEach((section) => {
	section.items.forEach((item) => {
		if (item.shortcut) {
			PAGE_SHORTCUTS[item.path] = item.shortcut;
		}
	});
});

function useNavigationShortcuts(router: ReturnType<typeof useRouter>) {
	React.useEffect(() => {
		let gTimeout: ReturnType<typeof setTimeout> | null = null;
		let gPressed = false;

		const clearG = () => {
			gPressed = false;
			if (gTimeout) {
				clearTimeout(gTimeout);
				gTimeout = null;
			}
		};

		const isEditable = (target: EventTarget | null) => {
			if (!(target instanceof HTMLElement)) return false;
			if (target.isContentEditable) return true;
			const tag = target.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
				return true;
			if (target.closest('[contenteditable="true"], [role="textbox"]')) {
				return true;
			}
			return false;
		};

		const routeMap: Record<string, string> = {
			e: "/",
			i: "/inbox",
			c: "/contacts",
			p: "/contacts/properties",
			g: "/contacts/groups",
			h: "/contacts/channels",
			t: "/templates",
			m: "/metrics",
			l: "/logs",
			k: "/api-keys",
			a: "/api-keys",
			d: "/domain",
			w: "/webhooks",
			n: "/integrations",
			s: "/smtp",
			",": "/settings",
			u: "/settings",
			b: "/settings/billing",
			W: "/settings/organization",
			O: "/settings/organization",
			P: "/settings/profile",
			S: "/settings/security",
			K: "/settings/shortcuts",
			H: "/settings/theme",
		};

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			if (isEditable(e.target)) return;

			const key = e.key;

			if (gPressed) {
				const path = routeMap[key] || routeMap[key.toLowerCase()];
				if (path) {
					e.preventDefault();
					e.stopPropagation();
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					router.push(path as any);
					clearG();
					return;
				}
				clearG();
			}

			if (key === "g" || key === "G") {
				gPressed = true;
				if (gTimeout) clearTimeout(gTimeout);
				gTimeout = setTimeout(clearG, 1000);
			}
		};

		window.addEventListener("keydown", onKeyDown, true);
		return () => {
			clearG();
			window.removeEventListener("keydown", onKeyDown, true);
		};
	}, [router]);
}

export interface CommandAction {
	id: string;
	label: string;
	icon: string;
	shortcut?: { label: string; keys: string[] };
	onSelect: () => void;
	variant?: "default" | "danger";
}

function BackspaceSvg({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 -0.5 25 25"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className || "size-3.5"}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M5.91006 12.6651L8.35606 15.5261C8.59533 15.82 8.95209 15.9935 9.33106 16.0001L13.0501 15.9931H16.2391C18.0288 16.0036 19.4885 14.5618 19.5001 12.7721V10.2221C19.4891 8.43193 18.0292 6.98953 16.2391 7.00006L9.33106 7.00706C8.95226 7.01341 8.59552 7.18647 8.35606 7.48006L5.91006 10.3421C5.36331 11.0199 5.36331 11.9872 5.91006 12.6651V12.6651Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12.1603 9.46359C11.864 9.17409 11.3892 9.17957 11.0997 9.47582C10.8102 9.77207 10.8156 10.2469 11.1119 10.5364L12.1603 9.46359ZM12.6469 12.0364C12.9431 12.3259 13.418 12.3204 13.7075 12.0242C13.997 11.7279 13.9915 11.2531 13.6953 10.9636L12.6469 12.0364ZM13.6963 10.9646C13.4006 10.6745 12.9258 10.6791 12.6357 10.9748C12.3456 11.2705 12.3502 11.7453 12.6458 12.0354L13.6963 10.9646ZM14.1748 13.5354C14.4705 13.8255 14.9454 13.8209 15.2355 13.5252C15.5255 13.2295 15.521 12.7547 15.2253 12.4646L14.1748 13.5354ZM13.6953 12.0364C13.9915 11.7469 13.997 11.2721 13.7075 10.9758C13.418 10.6796 12.9431 10.6741 12.6469 10.9636L13.6953 12.0364ZM11.1119 12.4636C10.8156 12.7531 10.8102 13.2279 11.0997 13.5242C11.3892 13.8204 11.864 13.8259 12.1603 13.5364L11.1119 12.4636ZM12.6458 10.9646C12.3502 11.2547 12.3456 11.7295 12.6357 12.0252C12.9258 12.3209 13.4006 12.3255 13.6963 12.0354L12.6458 10.9646ZM15.2253 10.5354C15.521 10.2453 15.5255 9.77046 15.2355 9.47477C14.9454 9.17909 14.4705 9.17454 14.1748 9.46462L15.2253 10.5354ZM11.1119 10.5364L12.6469 12.0364L13.6963 10.9636L12.1603 9.46359L11.1119 10.5364ZM12.6458 12.0354L14.1748 13.5354L15.2253 12.4646L13.6963 10.9646L12.6458 10.9646ZM12.6469 10.9636L11.1119 12.4636L12.1603 13.5364L13.6953 12.0364L12.6469 10.9636ZM13.6963 12.0354L15.2253 10.5354L14.1748 9.46462L12.6458 10.9646L13.6963 12.0354Z"
				fill="currentColor"
			/>
		</svg>
	);
}

function KbdBadge({ label }: { label: string }) {
	const parts = label.match(/([⌘⇧⌃⌥]|[^\s⌘⇧⌃⌥]+)/g) ?? [label];
	return (
		<span className="ml-auto flex shrink-0 items-center gap-1">
			{parts.map((part, i) => (
				<ActionKbd key={`${part}-${i}`} className="w-auto min-w-4 px-1">
					{part === "⌫" ? <BackspaceSvg className="size-3.5" /> : part}
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

	useNavigationShortcuts(router);

	// Global back: ⌘⌫ / Ctrl+Backspace. Skips form fields (native word/line delete)
	// and open dialogs so they keep owning Escape/dismiss.
	useHotkeys(
		"mod+backspace",
		(e) => {
			if (
				document.querySelector(
					'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
				)
			) {
				return;
			}
			e.preventDefault();
			router.back();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

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

	useHotkeys("t", (e) => {
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
				shortcut: { label: "T", keys: ["t"] },
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
