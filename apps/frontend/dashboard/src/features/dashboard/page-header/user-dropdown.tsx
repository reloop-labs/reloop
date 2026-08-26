import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useTheme } from "next-themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

export function UserDropdown({ user }: { user: HeaderUser | null }) {
	const { theme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const itemRefs = useRef<(HTMLElement | null)[]>([]);
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

	const { isOrgAdmin, canManageTeam } = useOrgPermissions();
	// Same RBAC as settings sidebar — members only see Account items.
	const filteredSettings = useMemo(
		() =>
			filterSettingsNavigation(settingsNavigation, {
				isOrgAdmin,
				canManageTeam,
			}),
		[isOrgAdmin, canManageTeam],
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
		return <div className="h-7 w-7 animate-pulse rounded-full bg-bg-weak-50" />;
	}

	const workspaceItems = workspaceSection?.items ?? [];
	const accountItems = (accountSection?.items ?? []).filter(
		(item) => item.path !== "/settings/theme",
	);
	const homeHoverIdx = workspaceItems.length + accountItems.length;
	const logoutHoverIdx = workspaceItems.length + accountItems.length + 1;

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
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
				sideOffset={8}
				className="w-[275px] rounded-[22px] border border-stroke-soft-200 bg-bg-white-0 p-2 shadow-[0_12px_36px_rgba(0,0,0,0.12)] ring-0 dark:border-white/10 dark:bg-[#141415] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
				side="bottom"
				align="end"
			>
				{/* Top user header card */}
				<div className="flex items-center justify-between rounded-[18px] border border-stroke-soft-200/80 bg-bg-weak-50/70 p-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
					<div className="min-w-0 flex-1 pr-2">
						<p className="truncate font-semibold text-[14.5px] text-text-strong-950 leading-tight dark:text-white">
							{user.name || "User"}
						</p>
						<p className="mt-0.5 truncate font-normal text-[12.5px] text-text-sub-600 dark:text-white/55">
							{user.email}
						</p>
					</div>
					<div className="relative shrink-0 rounded-full bg-gradient-to-tr from-[#f43f5e] via-[#c084fc] to-[#38bdf8] p-[2.5px] shadow-sm">
						<div className="rounded-full bg-bg-white-0 p-0.5 dark:bg-[#141415]">
							<UserAvatar
								name={user.name}
								email={user.email}
								image={user.image}
								size="32"
								className="size-9 rounded-full"
								initialsClassName="text-[12px]"
							/>
						</div>
					</div>
				</div>

				<div
					className="relative mt-2 flex flex-col gap-0.5"
					onPointerLeave={() => setHoverIdx(undefined)}
				>
					{workspaceItems.length > 0 ? (
						<>
							<Dropdown.Label className="px-2.5 pt-1.5 pb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
								Organization
							</Dropdown.Label>
							<Dropdown.Group className="gap-0.5">
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
											className="relative z-10 gap-2.5 rounded-xl px-2.5 py-2 font-medium text-[13.5px] text-text-sub-600 outline-none transition-colors hover:text-text-strong-950 data-[highlighted]:bg-transparent! dark:text-white/70 dark:hover:text-white"
											onClick={() => goToSettings(item.path)}
										>
											<SidebarNavIcon
												name={item.iconName}
												className="h-4 w-4 shrink-0 text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:text-white/70 dark:group-hover:text-white"
											/>
											<span className="flex-1 truncate">
												{isTeams ? "Invite user" : item.label}
											</span>
										</UserDropdownItem>
									);
								})}
							</Dropdown.Group>
							<div className="my-1.5 h-px bg-stroke-soft-100 dark:bg-white/10" />
						</>
					) : null}

					<Dropdown.Label className="px-2.5 pt-1.5 pb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
						Account
					</Dropdown.Label>
					<Dropdown.Group className="gap-0.5">
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
									className="relative z-10 gap-2.5 rounded-xl px-2.5 py-2 font-medium text-[13.5px] text-text-sub-600 outline-none transition-colors hover:text-text-strong-950 data-[highlighted]:bg-transparent! dark:text-white/70 dark:hover:text-white"
									onClick={() => goToSettings(item.path)}
								>
									{isProfile ? (
										<UserAvatar
											name={user.name}
											email={user.email}
											image={user.image}
											size="20"
											className="shrink-0"
											initialsClassName="text-[8px]"
										/>
									) : (
										<SidebarNavIcon
											name={item.iconName}
											className="h-4 w-4 shrink-0 text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:text-white/70 dark:group-hover:text-white"
										/>
									)}
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
							className="relative z-10 gap-2.5 rounded-xl px-2.5 py-2 font-medium text-[13.5px] text-text-sub-600 outline-none transition-colors hover:text-text-strong-950 data-[highlighted]:bg-transparent! dark:text-white/70 dark:hover:text-white"
							onClick={() => {
								setIsOpen(false);
								window.location.href = "/home";
							}}
						>
							<SidebarNavIcon
								name="home"
								className="h-4 w-4 shrink-0 text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:text-white/70 dark:group-hover:text-white"
							/>
							<span className="flex-1 truncate">Home</span>
						</UserDropdownItem>

						<div className="flex items-center justify-between rounded-xl px-2.5 py-2">
							<div className="flex items-center gap-2.5">
								<Icon
									name={
										theme === "system"
											? "laptop"
											: theme === "dark"
												? "moon"
												: "sun"
									}
									className="h-4 w-4 text-text-sub-600 dark:text-white/70"
								/>
								<span className="font-medium text-[13.5px] text-text-sub-600 dark:text-white/70">
									Theme
								</span>
							</div>
							<ThemeToggle />
						</div>
					</Dropdown.Group>

					<div className="my-1.5 h-px bg-stroke-soft-100 dark:bg-white/10" />

					<Dropdown.Group className="gap-0">
						<UserDropdownItem
							ref={(el) => {
								if (el) itemRefs.current[logoutHoverIdx] = el;
							}}
							onHoverEnter={() => setHoverIdx(logoutHoverIdx)}
							onHoverLeave={() => setHoverIdx(undefined)}
							className="relative z-10 gap-2.5 rounded-xl px-2.5 py-2 font-medium text-[13.5px] text-red-500 outline-none transition-colors hover:text-red-600 data-[highlighted]:bg-transparent! dark:hover:text-red-400"
							onClick={() => void handleSignOut()}
						>
							<Icon
								name="arrow-right-rec"
								className="h-3.5 w-3.5 text-red-500 transition-transform duration-200 group-hover:translate-x-0.5"
							/>
							<span className="flex-1 truncate">Log out</span>
						</UserDropdownItem>
					</Dropdown.Group>

					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={hoverIdx === logoutHoverIdx}
						className="rounded-xl"
					/>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
