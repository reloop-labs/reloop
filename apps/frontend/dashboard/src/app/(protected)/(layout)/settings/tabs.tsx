"use client";
import { useOrgPermissions } from "@fe/dashboard/hooks/use-org-permissions";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";



const list = [
	{
		title: "Workspace",
		path: "/settings",
		iconName: "gear",
	},
	{
		title: "Members",
		path: "/settings/members",
		iconName: "users",
		requiresTeamAdmin: true,
	},
	{
		title: "Profile",
		path: "/settings/profile",
		iconName: "user",
	},
	{
		title: "Theme",
		path: "/settings/theme",
		iconName: "swatch-book",
	},
	{
		title: "Security",
		path: "/settings/security",
		iconName: "shield-check",
	},
] as const;

export const SettingsTabs = () => {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const pathname = usePathname();
	const router = useRouter();
	const { canManageTeam, canManageBilling, isPending } = useOrgPermissions();

	const visibleList = useMemo(
		() =>
			list.filter((item) => {
				if ("requiresTeamAdmin" in item && item.requiresTeamAdmin) {
					return canManageTeam;
				}
				if ("requiresBillingAdmin" in item && item.requiresBillingAdmin) {
					return canManageBilling;
				}
				return true;
			}),
		[canManageTeam, canManageBilling],
	);

	const activeIndex = visibleList.findIndex((item) => item.path === pathname);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	if (isPending) {
		return (
			<div className="h-10 border-stroke-soft-200 border-b dark:border-stroke-soft-100/40" />
		);
	}

	return (
		<TabMenuHorizontal.Root defaultValue="/settings" value={pathname}>
			<TabMenuHorizontal.List className="relative h-10 gap-0 border-b! py-0">
				{visibleList.map(({ path, title, iconName }, index) => (
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
						<Icon name={iconName} className="h-4 w-4" />
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
