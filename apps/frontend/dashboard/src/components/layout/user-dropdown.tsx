"use client";

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
					<Avatar.Root size="24" color="gray">
						{user.image ? (
							<Avatar.Image src={user.image} alt={user.name} color="blue" />
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
				<div className="px-3 py-2 pb-1.5">
					<p className="truncate font-medium text-xs">{user.email}</p>
				</div>
				<div className="h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
				<div className="relative p-1">
					<Dropdown.Group>
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[0] = el;
							}}
							className="gap-2.5 px-3 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(0)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => router.push("/settings")}
						>
							<Icon name="user-circle" className="h-4 w-4 text-text-sub-600" />
							<span className="flex-1 truncate">My profile</span>
						</Dropdown.Item>

						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[1] = el;
							}}
							className="gap-2.5 px-3 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(1)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						>
							<Icon
								name={theme === "dark" ? "sun" : "moon"}
								className="h-4 w-4 text-text-sub-600"
							/>
							<span className="flex-1 truncate">Toggle theme</span>
							<span className="flex h-5 w-5 items-center justify-center rounded bg-bg-weak-50 font-medium text-[10px] text-text-soft-400">
								M
							</span>
						</Dropdown.Item>
					</Dropdown.Group>

					<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

					<Dropdown.Group>
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[2] = el;
							}}
							className="gap-2.5 px-3 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(2)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => router.push("/settings")}
						>
							<Icon name="gear" className="h-4 w-4 text-text-sub-600" />
							<span className="flex-1 truncate">Settings</span>
							<span className="flex items-center gap-0.5 font-medium text-[10px] text-text-soft-400 opacity-60">
								<span>⇧</span>
								<span>⌘</span>
								<span>,</span>
							</span>
						</Dropdown.Item>
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[4] = el;
							}}
							className="gap-2.5 px-3 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(4)}
							onPointerLeave={() => setHoverIdx(undefined)}
						>
							<Icon name="info-outline" className="h-4 w-4 text-text-sub-600" />
							<span className="flex-1 truncate">Get help</span>
						</Dropdown.Item>
					</Dropdown.Group>

					<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

					<Dropdown.Group>
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[5] = el;
							}}
							className="gap-2.5 px-3 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(5)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => router.push("/settings/billing")}
						>
							<Icon
								name="arrow-top-circle"
								className="h-4 w-4 text-text-sub-600"
							/>
							<span className="flex-1 truncate">Upgrade plan</span>
						</Dropdown.Item>

						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[7] = el;
							}}
							className="gap-2.5 px-3 py-1.5 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(7)}
							onPointerLeave={() => setHoverIdx(undefined)}
						>
							<Icon name="info-outline" className="h-4 w-4 text-text-sub-600" />
							<span className="flex-1 truncate">Learn more</span>
							<Icon
								name="right"
								className="h-3 w-3 text-text-soft-400 opacity-40"
							/>
						</Dropdown.Item>
					</Dropdown.Group>
					<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

					<Dropdown.Group>
						<Dropdown.Item
							ref={(el) => {
								if (el) itemRefs.current[10] = el;
							}}
							className="gap-2.5 px-3 py-1.5 text-red-500 data-[highlighted]:bg-transparent!"
							onPointerEnter={() => setHoverIdx(10)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => handleAction("", "signout")}
						>
							<Icon name="arrow-right-rec" className="h-4 w-4 text-red-500" />
							<span className="flex-1 truncate">Log out</span>
						</Dropdown.Item>
					</Dropdown.Group>

					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={hoverIdx === 10}
					/>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
