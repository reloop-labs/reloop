"use client";

import { useOrgPermissions } from "@fe/dashboard/hooks/use-org-permissions";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "../animated-hover-background";

export const UserDropdown = () => {
	const { user } = useUserOrganization();
	const { canManageBilling } = useOrgPermissions();
	const { theme, setTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const itemRefs = useRef<(HTMLElement | null)[]>([]);
	const router = useRouter();

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
		return <div className="h-7 w-7 animate-pulse rounded-full bg-bg-weak-50" />;
	}

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
					<Avatar.Root size="24" color="blue">
						{user.image ? (
							<Avatar.Image src={user.image} alt={user.name} />
						) : (
							<Avatar.Image asChild>
								<div
									className={cn(
										"flex h-full w-full items-center justify-center rounded-full font-medium text-[10px] text-white uppercase tracking-wide shadow-sm",
										getAvatarGradient(user.email),
									)}
								>
									{getAvatarInitial(user.name, user.email)}
								</div>
							</Avatar.Image>
						)}
					</Avatar.Root>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				sideOffset={8}
				className="w-56"
				side="bottom"
				align="end"
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
							onClick={() => router.push("/profile")}
						>
							<Avatar.Root size="20" color="blue" className="shrink-0">
								{user.image ? (
									<Avatar.Image src={user.image} alt={user.name} />
								) : (
									<Avatar.Image asChild>
										<div
											className={cn(
												"flex h-full w-full items-center justify-center rounded-full font-medium text-[8px] text-white uppercase tracking-wide",
												getAvatarGradient(user.email),
											)}
										>
											{getAvatarInitial(user.name, user.email)}
										</div>
									</Avatar.Image>
								)}
							</Avatar.Root>
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
							onClick={() => router.push("/settings")}
						>
							<Icon name="gear" className="h-4 w-4 text-text-sub-600" />
							<span className="flex-1 truncate text-sm">Settings</span>
							<span className="flex items-center gap-0.5 font-medium text-[10px] text-text-soft-400 opacity-60">
								<span>⇧</span>
								<span>⌘</span>
								<span>,</span>
							</span>
						</Dropdown.Item>
					</Dropdown.Group>

					{canManageBilling && (
						<>
							<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
							<Dropdown.Group className="gap-0">
								<Dropdown.Item
									ref={(el) => {
										if (el) itemRefs.current[5] = el;
									}}
									className="gap-2 px-2 py-1.5 data-[highlighted]:bg-transparent!"
									onPointerEnter={() => setHoverIdx(5)}
									onPointerLeave={() => setHoverIdx(undefined)}
									onClick={() => router.push("/settings/credits")}
								>
									<Icon
										name="arrow-top-circle"
										className="h-4 w-4 text-text-sub-600"
									/>
									<span className="flex-1 truncate text-sm">Manage credits</span>
								</Dropdown.Item>
							</Dropdown.Group>
						</>
					)}
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
