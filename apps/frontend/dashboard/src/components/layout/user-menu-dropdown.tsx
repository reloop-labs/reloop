"use client";

import { userNavigation } from "@fe/dashboard/constants";
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
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "../animated-hover-background";

interface User {
	name: string;
	email: string;
	image?: string | null;
}

interface UserMenuDropdownProps {
	user: User;
	isCollapsed?: boolean;
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
	user,
	isCollapsed = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const router = useRouter();

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = userNavigation[hoverIdx ?? -1];
	const isDanger = hoveredItem?.variant === "danger";

	const handleAction = async (path: string, action: string | undefined) => {
		if (action === "signout") {
			await authClient.signOut();
			router.push("/login");
		} else {
			router.push(path);
		}
	};

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					className={cn(
						"flex h-auto w-full cursor-pointer items-center gap-2.5 px-2 py-2",
						isCollapsed ? "justify-center" : "justify-start",
						isOpen && "bg-bg-weak-50",
					)}
				>
					<div className="relative flex-shrink-0">
						<Avatar.Root size="32" color="gray">
							{user.image ? (
								<Avatar.Image src={user.image} alt={user.name} />
							) : (
								<Avatar.Image asChild>
									<div
										className={cn(
											"flex h-full w-full items-center justify-center rounded-full font-medium text-[13px] text-white uppercase tracking-wide shadow-sm",
											getAvatarGradient(user.email),
										)}
									>
										{getAvatarInitial(user.name, user.email)}
									</div>
								</Avatar.Image>
							)}
						</Avatar.Root>
						<span className="-right-0.5 -bottom-0.5 absolute block h-3 w-3 rounded-full border-2 border-white bg-success-base dark:border-[#101010]" />
					</div>
					{!isCollapsed && (
						<div className="flex min-w-0 flex-1 flex-col items-start gap-px">
							<p className="w-full truncate text-left font-medium text-sm text-text-strong-950">
								{user.email}
							</p>
							<p className="w-full truncate text-left text-text-sub-600 text-xs">
								Free plan
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
				<div className="relative">
					{userNavigation.map(
						({ path, label, iconName, variant, action }, navIdx) => {
							const isItemDanger = variant === "danger";
							return (
								<button
									key={path + label}
									ref={(el) => {
										if (el) {
											buttonRefs.current[navIdx] = el;
										}
									}}
									type="button"
									onPointerEnter={() => setHoverIdx(navIdx)}
									onPointerLeave={() => setHoverIdx(undefined)}
									className={cn(
										"flex w-full cursor-pointer items-center justify-start gap-2.5 rounded-lg px-3 py-2 font-normal",
										isItemDanger ? "text-red-500" : "",
										!currentRect &&
											hoverIdx === navIdx &&
											(isItemDanger
												? "bg-red-alpha-10"
												: "bg-neutral-alpha-10"),
									)}
									onClick={() => handleAction(path, action)}
								>
									<Icon
										name={iconName}
										className={cn(
											"h-4 w-4",
											isItemDanger ? "" : "text-text-sub-600",
										)}
									/>
									<p className="text-sm">{label}</p>
								</button>
							);
						},
					)}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={isDanger}
					/>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
