import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { forwardRef, useMemo, useRef, useState } from "react";
import { useSignOut } from "#/features/auth/session-query";
import {
	filterSettingsNavigation,
	settingsNavigation,
} from "#/features/dashboard/navigation";
import { SidebarNavIcon } from "#/features/dashboard/sidebar/sidebar-nav-icon";
import { usePlayAnimationOnHover } from "#/features/dashboard/sidebar/use-play-animation-on-hover";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { ThemeToggle } from "./theme-toggle";
import { UserAvatar } from "./user-avatar";

type HeaderUser = {
	name: string;
	email: string;
	image?: string | null;
};

interface UserDropdownItemProps
	extends React.ComponentPropsWithoutRef<typeof Dropdown.Item> {
	onHoverEnter?: () => void;
	onHoverLeave?: () => void;
}

const UserDropdownItem = forwardRef<HTMLDivElement, UserDropdownItemProps>(
	function UserDropdownItem(
		{ onHoverEnter, onHoverLeave, className, children, ...props },
		ref,
	) {
		const { groupProps } = usePlayAnimationOnHover();

		return (
			<Dropdown.Item
				ref={ref}
				className={cn("group", className)}
				{...groupProps}
				onPointerEnter={(e) => {
					groupProps.onPointerEnter();
					onHoverEnter?.();
					props.onPointerEnter?.(e);
				}}
				onPointerLeave={(e) => {
					groupProps.onPointerLeave();
					onHoverLeave?.();
					props.onPointerLeave?.(e);
				}}
				{...props}
			>
				{children}
			</Dropdown.Item>
		);
	},
);

/** Trigger is a 28px circle; the panel is inset 4px on every side, avatar included. Only the avatar corner stays fully round. */
const TRIGGER_SIZE = 28;
const ISLAND_INSET = 4;

/** Same 28px circle as the avatar trigger. */
export function UserDropdownSkeleton() {
	return <div className="h-7 w-7 animate-pulse rounded-full bg-bg-weak-50" />;
}

export function UserDropdown({ user }: { user: HeaderUser | null }) {
	const { theme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const itemRefs = useRef<(HTMLElement | null)[]>([]);
	const closePressRef = useRef(false);
	const router = useRouter();
	const signOut = useSignOut();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const search = Object.fromEntries(searchParams.entries());
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const fromParam =
		typeof (search as { from?: unknown }).from === "string"
			? (search as { from: string }).from
			: null;

	const { isOrgAdmin, canManageTeam, canManageBilling } = useOrgPermissions();
	// Same RBAC as settings sidebar: members only see Account items.
	const filteredSettings = useMemo(
		() =>
			filterSettingsNavigation(settingsNavigation, {
				isOrgAdmin,
				canManageTeam,
				canManageBilling,
			}),
		[isOrgAdmin, canManageTeam, canManageBilling],
	);
	const workspaceSection = filteredSettings.find(
		(s) => s.section === "Workspace",
	);
	const accountSection = filteredSettings.find((s) => s.section === "Account");

	const getFrom = () => {
		if (!pathWithoutSlug.startsWith("/settings")) return pathWithoutSlug;
		return fromParam || "/";
	};

	const goToSettings = (path: string) => {
		router.push(`${path}?from=${encodeURIComponent(getFrom())}`);
		setIsOpen(false);
	};

	const currentTab = itemRefs.current[hoverIdx ?? -1] || undefined;
	const currentRect = currentTab?.getBoundingClientRect();

	const handleSignOut = async () => {
		setIsOpen(false);
		await signOut();
	};

	if (!user) {
		return <UserDropdownSkeleton />;
	}

	const workspaceItems = workspaceSection?.items ?? [];
	const accountItems = (accountSection?.items ?? []).filter(
		(item) => item.path !== "/settings/theme",
	);
	const homeHoverIdx = workspaceItems.length + accountItems.length;
	const logoutHoverIdx = workspaceItems.length + accountItems.length + 1;

	return (
		<Dropdown.Root
			open={isOpen}
			onOpenChange={(open) => {
				closePressRef.current = false;
				setIsOpen(open);
			}}
		>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className={cn(
						"flex h-7 w-7 cursor-pointer items-center justify-center rounded-full p-0!",
						"transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95",
						isOpen && "bg-bg-weak-50",
					)}
				>
					<UserAvatar
						name={user.name}
						email={user.email}
						image={user.image}
						size="24"
						initialsClassName="text-[10px]"
					/>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				// Island: the panel's avatar slot lands exactly on the trigger, so
				// the menu reads as growing out of the avatar (see styles.css).
				side="bottom"
				align="end"
				sideOffset={-(TRIGGER_SIZE + ISLAND_INSET)}
				alignOffset={-ISLAND_INSET}
				avoidCollisions={false}
				// Only the avatar corner hugs the circle (14px + 4px inset).
				style={{ borderRadius: "12px 18px 12px 12px" }}
				className="user-menu-island w-[264px] gap-0 bg-bg-white-0 p-1 shadow-regular-md ring-1 ring-stroke-soft-200 ring-inset"
			>
				{/* Identity: text uses the same 14px inset as rows; avatar sits where the trigger was */}
				<div className="relative">
					<div className="user-menu-island-body min-w-0 px-2.5 pt-2.5 pr-10">
						<p className="truncate font-medium text-[13px] text-text-strong-950 leading-4">
							{user.name || "User"}
						</p>
						<p className="mt-0.5 truncate text-[12px] text-text-soft-400 leading-4">
							{user.email}
						</p>
					</div>
					<button
						type="button"
						aria-label="Close menu"
						// This button sits exactly over the trigger. On touch the menu opens on
						// pointerdown and the tap's click lands here, closing it instantly, so
						// only close when the press also started on this button.
						onPointerDown={() => {
							closePressRef.current = true;
						}}
						onClick={(e) => {
							const startedHere = closePressRef.current || e.detail === 0;
							closePressRef.current = false;
							if (startedHere) setIsOpen(false);
						}}
						className="absolute top-0 right-0 flex size-7 cursor-pointer items-center justify-center rounded-full outline-none"
					>
						<UserAvatar
							name={user.name}
							email={user.email}
							image={user.image}
							size="24"
							initialsClassName="text-[10px]"
						/>
					</button>
				</div>

				<div className="user-menu-island-body">
					<div className="mx-2.5 mt-3 mb-1.5 h-px bg-stroke-soft-200" />

					<div
						className="relative flex flex-col"
						onPointerLeave={() => setHoverIdx(undefined)}
					>
						{workspaceItems.length > 0 ? (
							<>
								<Dropdown.Label className="px-2.5 pt-1.5 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]">
									Organization
								</Dropdown.Label>
								<Dropdown.Group className="gap-0">
									{workspaceItems.map((item, index) => {
										const isTeams = item.path === "/settings/teams";
										return (
											<UserDropdownItem
												key={item.path}
												ref={(el) => {
													if (el) itemRefs.current[index] = el;
												}}
												onHoverEnter={() => setHoverIdx(index)}
												onHoverLeave={() => setHoverIdx(undefined)}
												className="relative z-10 h-8 gap-2.5 rounded-lg px-2.5 py-0 font-medium text-[13px] text-text-sub-600 outline-none transition-colors duration-150 ease-out hover:text-text-strong-950 data-[highlighted]:bg-transparent!"
												onClick={() => goToSettings(item.path)}
											>
												<SidebarNavIcon name={item.iconName} />
												<span className="flex-1 truncate">
													{isTeams ? "Invite user" : item.label}
												</span>
											</UserDropdownItem>
										);
									})}
								</Dropdown.Group>
							</>
						) : null}

						<Dropdown.Label
							className={cn(
								"px-2.5 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]",
								workspaceItems.length > 0 ? "pt-4" : "pt-1.5",
							)}
						>
							Account
						</Dropdown.Label>
						<Dropdown.Group className="gap-0">
							{accountItems.map((item, index) => {
								const idx = workspaceItems.length + index;
								const isProfile = item.path === "/settings/profile";
								return (
									<UserDropdownItem
										key={item.path}
										ref={(el) => {
											if (el) itemRefs.current[idx] = el;
										}}
										onHoverEnter={() => setHoverIdx(idx)}
										onHoverLeave={() => setHoverIdx(undefined)}
										className="relative z-10 h-8 gap-2.5 rounded-lg px-2.5 py-0 font-medium text-[13px] text-text-sub-600 outline-none transition-colors duration-150 ease-out hover:text-text-strong-950 data-[highlighted]:bg-transparent!"
										onClick={() => goToSettings(item.path)}
									>
										<SidebarNavIcon name={item.iconName} />
										<span className="flex-1 truncate">
											{isProfile ? "My profile" : item.label}
										</span>
									</UserDropdownItem>
								);
							})}

							<UserDropdownItem
								ref={(el) => {
									if (el) itemRefs.current[homeHoverIdx] = el;
								}}
								onHoverEnter={() => setHoverIdx(homeHoverIdx)}
								onHoverLeave={() => setHoverIdx(undefined)}
								className="relative z-10 h-8 gap-2.5 rounded-lg px-2.5 py-0 font-medium text-[13px] text-text-sub-600 outline-none transition-colors duration-150 ease-out hover:text-text-strong-950 data-[highlighted]:bg-transparent!"
								onClick={() => {
									setIsOpen(false);
									window.location.href = "/home";
								}}
							>
								<SidebarNavIcon name="home" />
								<span className="flex-1 truncate">Home</span>
							</UserDropdownItem>

							<div className="flex h-8 items-center justify-between rounded-lg pr-0.5 pl-2.5">
								<div className="flex items-center gap-2.5">
									<Icon
										name={
											theme === "system"
												? "laptop"
												: theme === "dark"
													? "moon"
													: "sun"
										}
										className="size-4 shrink-0 text-text-sub-600 opacity-70"
									/>
									<span className="font-medium text-[13px] text-text-sub-600">
										Theme
									</span>
								</div>
								<ThemeToggle subtle />
							</div>
						</Dropdown.Group>

						<div className="mx-2.5 my-1.5 h-px bg-stroke-soft-200" />

						<Dropdown.Group className="gap-0">
							<UserDropdownItem
								ref={(el) => {
									if (el) itemRefs.current[logoutHoverIdx] = el;
								}}
								onHoverEnter={() => setHoverIdx(logoutHoverIdx)}
								onHoverLeave={() => setHoverIdx(undefined)}
								className="relative z-10 h-8 gap-2.5 rounded-lg px-2.5 py-0 font-medium text-[13px] text-red-500 outline-none transition-colors hover:text-red-600 data-[highlighted]:bg-transparent! dark:text-red-400 dark:hover:text-red-300"
								onClick={() => void handleSignOut()}
							>
								<Icon
									name="arrow-right-rec"
									className="size-4 text-red-500 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-red-400"
								/>
								<span className="flex-1 truncate">Log out</span>
							</UserDropdownItem>
						</Dropdown.Group>

						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={hoverIdx === logoutHoverIdx}
							className="rounded-lg"
						/>
					</div>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
