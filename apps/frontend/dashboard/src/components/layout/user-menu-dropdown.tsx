"use client";

import { UserAvatar } from "@fe/dashboard/components/user-avatar";
import {
	SETTINGS_ADMIN_HOME,
	SETTINGS_MEMBER_HOME,
} from "@fe/dashboard/constants/navigation";
import { useOrgPermissions } from "@fe/dashboard/hooks/use-org-permissions";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "../animated-hover-background";

interface User {
	name: string;
	email: string;
	image?: string | null;
}

interface UserMenuDropdownProps {
	user: User | null | undefined;
	isCollapsed?: boolean;
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
	user,
	isCollapsed = false,
}) => {
	const {
		canManageBilling,
		isOrgAdmin,
		isPending: rolePending,
	} = useOrgPermissions();
	const settingsHome =
		!rolePending && !isOrgAdmin ? SETTINGS_MEMBER_HOME : SETTINGS_ADMIN_HOME;
	const { theme, setTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const itemRefs = useRef<(HTMLElement | null)[]>([]);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const fromParam = searchParams.get("from");

	const getHref = (path: string) => {
		const fromVal = !pathname.startsWith("/settings")
			? pathname
			: fromParam || "/";
		return `${path}?from=${encodeURIComponent(fromVal)}`;
	};

	const currentTab = itemRefs.current[hoverIdx ?? -1] || undefined;
	const currentRect = currentTab?.getBoundingClientRect();

	const handleAction = async (path: string, action: string | undefined) => {
		if (action === "signout") {
			await authClient.signOut();
			router.push("/login");
		} else {
			router.push(path);
		}
		setIsOpen(false);
	};

	if (!user) {
		// Skeleton while user data loads — layout renders immediately
		return (
			<div
				className={cn(
					"flex h-auto w-full items-center gap-2.5 px-2 py-2",
					isCollapsed ? "justify-center" : "justify-start",
				)}
			>
				<div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-bg-weak-50" />
				{!isCollapsed && (
					<div className="flex flex-1 flex-col gap-1.5">
						<div className="h-3 w-28 animate-pulse rounded bg-bg-weak-50" />
						<div className="h-2.5 w-16 animate-pulse rounded bg-bg-weak-50" />
					</div>
				)}
			</div>
		);
	}

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					className={cn(
						"flex cursor-pointer items-center transition-all",
						isCollapsed
							? "h-9 w-9 justify-center rounded-lg p-0"
							: "h-auto w-full justify-start gap-2.5 rounded-2xl! px-2 py-2",
					)}
				>
					<div className="relative flex-shrink-0">
						<UserAvatar
							name={user.name}
							email={user.email}
							image={user.image}
							size="24"
							initialsClassName="text-[13px]"
						/>
					</div>
					{!isCollapsed && (
						<div className="flex min-w-0 flex-1 flex-col items-start gap-px">
							<p className="w-full truncate text-left font-medium text-sm text-text-sub-600">
								{user.email}
							</p>
						</div>
					)}
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				sideOffset={16}
				className="w-56"
				side="top"
				align="start"
			>
				<div className="px-2.5 py-2 pb-1.5">
					<p className="truncate font-medium text-xs">{user.email}</p>
				</div>
				<div className="h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
				<div className="relative">
					<Dropdown.Group className="gap-0">
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[0] = el;
							}}
							className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(0)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => router.push(getHref("/settings/profile"))}
						>
							<UserAvatar
								name={user.name}
								email={user.email}
								image={user.image}
								size="20"
								className="shrink-0"
								initialsClassName="text-[8px]"
							/>
							<span className="flex-1 truncate text-sm">My profile</span>
						</Dropdown.Item>

						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[1] = el;
							}}
							className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(1)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						>
							<Icon
								name={theme === "dark" ? "sun" : "moon"}
								className="h-4 w-4 text-text-sub-600"
							/>
							<span className="flex-1 truncate text-sm">Toggle theme</span>
							<span className="flex h-5 w-5 items-center justify-center rounded bg-bg-weak-50 font-medium text-[10px] text-text-soft-400">
								M
							</span>
						</Dropdown.Item>
					</Dropdown.Group>

					<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

					<Dropdown.Group className="gap-0">
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[2] = el;
							}}
							className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(2)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => router.push(getHref(settingsHome))}
						>
							<Icon name="gear" className="h-4 w-4 text-text-sub-600" />
							<span className="flex-1 truncate text-sm">Settings</span>
							<span className="flex items-center gap-0.5 font-medium text-[10px] text-text-soft-400 opacity-60">
								<span>⇧</span>
								<span>⌘</span>
								<span>,</span>
							</span>
						</Dropdown.Item>
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[3] = el;
							}}
							className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(3)}
							onPointerLeave={() => setHoverIdx(undefined)}
						>
							<Icon name="question" className="h-4 w-4 text-text-sub-600" />
							<span className="flex-1 truncate text-sm">Get help</span>
						</Dropdown.Item>
					</Dropdown.Group>

					<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

					<Dropdown.Group className="gap-0">
						{canManageBilling && (
							<Dropdown.Item
								ref={(el) => {
									if (el) itemRefs.current[5] = el;
								}}
								className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
								onPointerEnter={() => setHoverIdx(5)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => router.push(getHref("/settings/billing"))}
							>
								<Icon
									name="arrow-top-circle"
									className="h-4 w-4 text-text-sub-600"
								/>
								<span className="flex-1 truncate text-sm">
									Billing & credits
								</span>
							</Dropdown.Item>
						)}

						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[7] = el;
							}}
							className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(7)}
							onPointerLeave={() => setHoverIdx(undefined)}
						>
							<Icon name="info-outline" className="h-4 w-4 text-text-sub-600" />
							<span className="flex-1 truncate text-sm">Learn more</span>
							<Icon
								name="right"
								className="h-3 w-3 text-text-soft-400 opacity-40"
							/>
						</Dropdown.Item>
					</Dropdown.Group>
					<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

					<Dropdown.Group className="gap-0">
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[10] = el;
							}}
							className="gap-2 px-2 py-1.5 text-red-500 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(10)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => handleAction("", "signout")}
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
						isDanger={hoverIdx === 10}
						className="rounded-[10px]"
					/>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
