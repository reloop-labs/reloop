"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

const list = [
	{
		title: "Profile",
		path: "/profile",
		iconName: "user",
	},
	{
		title: "Security",
		path: "/profile/security",
		iconName: "shield-check",
	},
	{
		title: "Appearance",
		path: "/profile/appearance",
		iconName: "swatch-book",
	},
];

export const SettingsTabs = () => {
	const { user } = useUserOrganization();
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const pathname = usePathname();
	const router = useRouter();
	const activeIndex = list.findIndex((item) => item.path === pathname);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	const getTabValue = (pathname: string) => {
		return pathname;
	};

	return (
		<TabMenuHorizontal.Root
			defaultValue="/settings"
			value={getTabValue(pathname)}
		>
			<TabMenuHorizontal.List className="relative h-10 gap-0 border-b! py-0">
				{list.map(({ path, title, iconName }, index) => (
					<TabMenuHorizontal.Trigger
						ref={(el) => {
							if (el) {
								buttonRefs.current[index] = el;
							}
						}}
						onPointerEnter={() => setHoveredIdx(index)}
						onPointerLeave={() => setHoveredIdx(undefined)}
						className={cn(
							"flex cursor-pointer items-center gap-2 px-2.5 py-0! font-medium text-sm",
							hoveredIdx === undefined &&
								activeIndex === index &&
								"text-text-strong-950",
						)}
						key={path}
						value={path}
						onClick={() => {
							router.push(path);
						}}
					>
						{title === "Profile" && user ? (
							<Avatar.Root size="16" color="blue" className="shrink-0">
								{user.image ? (
									<Avatar.Image src={user.image} alt={user.name} />
								) : (
									<Avatar.Image asChild>
										<div
											className={cn(
												"flex h-full w-full items-center justify-center rounded-full font-medium text-[7px] text-white uppercase tracking-wide",
												getAvatarGradient(user.email),
											)}
										>
											{getAvatarInitial(user.name, user.email)}
										</div>
									</Avatar.Image>
								)}
							</Avatar.Root>
						) : (
							<Icon name={iconName} className="h-4 w-4" />
						)}
						{title}
					</TabMenuHorizontal.Trigger>
				))}
				<AnimatePresence>
					{rect && activeIndex !== -1 ? (
						<motion.div
							className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
							initial={{
								pointerEvents: "none",
								width: rect.width,
								height: rect.height - 20,
								left:
									rect.left -
									(tab?.offsetParent?.getBoundingClientRect().left || 0),
								top:
									rect.top -
									(tab?.offsetParent?.getBoundingClientRect().top || 0) +
									10,
								opacity: 0,
							}}
							animate={{
								pointerEvents: "none",
								width: rect.width,
								height: rect.height - 20,
								left:
									rect.left -
									(tab?.offsetParent?.getBoundingClientRect().left || 0),
								top:
									rect.top -
									(tab?.offsetParent?.getBoundingClientRect().top || 0) +
									10,
								opacity: 1,
							}}
							exit={{
								pointerEvents: "none",
								opacity: 0,
								width: rect.width,
								height: rect.height - 20,
								left:
									rect.left -
									(tab?.offsetParent?.getBoundingClientRect().left || 0),
								top:
									rect.top -
									(tab?.offsetParent?.getBoundingClientRect().top || 0) +
									10,
							}}
							transition={{ duration: 0.14 }}
						/>
					) : null}
				</AnimatePresence>
			</TabMenuHorizontal.List>
		</TabMenuHorizontal.Root>
	);
};
