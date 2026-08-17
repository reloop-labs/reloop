import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useTheme } from "next-themes";
import { useMemo, useRef, useState } from "react";
import { useSignOut } from "#/features/auth/session-query";
import {
	filterSettingsNavigation,
	settingsNavigation,
} from "#/features/dashboard/navigation";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { ThemeToggle } from "./theme-toggle";
import { UserAvatar } from "./user-avatar";

type HeaderUser = {
	name: string;
	email: string;
	image?: string | null;
};

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
				className="w-56"
				side="bottom"
				align="end"
			>
				<div className="px-2.5 py-2 pb-1.5">
					<p className="truncate font-medium text-text-sub-600 text-xs">
						{user.email}
					</p>
				</div>
				<div className="h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
				<div className="relative">
					{workspaceItems.length > 0 ? (
						<>
							<Dropdown.Label className="px-2.5 pt-2 pb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
								Organization
							</Dropdown.Label>
							<Dropdown.Group className="gap-0">
								{workspaceItems.map((item, index) => {
									const isTeams = item.path === "/settings/teams";
									return (
										<Dropdown.Item
											key={item.path}
											ref={(el) => {
												if (el) itemRefs.current[index] = el;
											}}
											className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
											onPointerEnter={() => setHoverIdx(index)}
											onPointerLeave={() => setHoverIdx(undefined)}
											onClick={() => goToSettings(item.path)}
										>
											<Icon
												name={item.iconName}
												className="h-4 w-4 text-text-sub-600"
											/>
											<span className="flex-1 truncate text-sm">
												{isTeams ? "Invite user" : item.label}
											</span>
										</Dropdown.Item>
									);
								})}
							</Dropdown.Group>
							<div className="my-1.5 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
						</>
					) : null}

					<Dropdown.Label className="px-2.5 pt-1.5 pb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
						Account
					</Dropdown.Label>
					<Dropdown.Group className="gap-0">
						{accountItems.map((item, index) => {
							const idx = workspaceItems.length + index;
							const isProfile = item.path === "/settings/profile";
							return (
								<Dropdown.Item
									key={item.path}
									ref={(el) => {
										if (el) itemRefs.current[idx] = el;
									}}
									className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
									onPointerEnter={() => setHoverIdx(idx)}
									onPointerLeave={() => setHoverIdx(undefined)}
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
										<Icon
											name={item.iconName}
											className="h-4 w-4 text-text-sub-600"
										/>
									)}
									<span className="flex-1 truncate text-sm">
										{isProfile ? "My profile" : item.label}
									</span>
								</Dropdown.Item>
							);
						})}

						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[homeHoverIdx] = el;
							}}
							className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(homeHoverIdx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => {
								setIsOpen(false);
								window.location.href = "/home";
							}}
						>
							<Icon name="home" className="h-4 w-4 text-text-sub-600" />
							<span className="flex-1 truncate text-sm">Home</span>
						</Dropdown.Item>

						<div className="flex items-center justify-between px-2.5 py-1.5">
							<div className="flex items-center gap-2">
								<Icon
									name={
										theme === "system"
											? "laptop"
											: theme === "dark"
												? "moon"
												: "sun"
									}
									className="h-4 w-4 text-text-sub-600"
								/>
								<span className="font-medium text-sm text-text-sub-600">
									Theme
								</span>
							</div>
							<ThemeToggle />
						</div>
					</Dropdown.Group>

					<div className="my-1.5 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

					<Dropdown.Group className="gap-0">
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[logoutHoverIdx] = el;
							}}
							className="gap-2 px-2 py-1.5 text-red-500 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(logoutHoverIdx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => void handleSignOut()}
						>
							<Icon
								name="arrow-right-rec"
								className="h-3.5 w-3.5 text-red-500"
							/>
							<span className="flex-1 truncate text-sm">Log out</span>
						</Dropdown.Item>
					</Dropdown.Group>

					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={hoverIdx === logoutHoverIdx}
						className="rounded-[10px]"
					/>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
