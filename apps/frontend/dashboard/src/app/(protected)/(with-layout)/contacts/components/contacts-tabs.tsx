"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

const items = [
	{
		title: "Contacts",
		value: "contacts",
		iconName: "users",
	},
	{
		title: "Properties",
		value: "properties",
		iconName: "tag",
	},
	{
		title: "Groups",
		value: "groups",
		iconName: "modules",
	},
	{
		title: "Topics",
		value: "topics",
		iconName: "notification-indicator",
	},
];

export const ContactsTabs = () => {
	const router = useRouter();
	const pathname = usePathname();
	const { activeOrganization } = useUserOrganization();
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);

	const isPropertiesPage = pathname.includes("/contacts/properties");
	const isTopicsPage = pathname.includes("/contacts/topics");
	const isGroupsPage = pathname.includes("/contacts/groups");
	const effectiveTabValue = isPropertiesPage
		? "properties"
		: isTopicsPage
			? "topics"
			: isGroupsPage
				? "groups"
				: "contacts";

	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const activeIndex = items.findIndex(
		(item) => item.value === effectiveTabValue,
	);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	return (
		<TabMenuHorizontal.Root defaultValue="contacts" value={effectiveTabValue}>
			<TabMenuHorizontal.List className="relative h-10 gap-0 border-b! py-0">
				{items.map(({ value, title, iconName }, index) => (
					<TabMenuHorizontal.Trigger
						ref={(el) => {
							if (el) {
								buttonRefs.current[index] = el;
							}
						}}
						onPointerEnter={() => setHoveredIdx(index)}
						onPointerLeave={() => setHoveredIdx(undefined)}
						className={cn(
							"flex cursor-pointer items-center gap-2 px-2.5 py-0! text-sm",
							hoveredIdx === undefined &&
								activeIndex === index &&
								"text-text-strong-950",
						)}
						key={value}
						value={value}
						onClick={() => {
							if (value === "properties") {
								router.push(`/contacts/properties`);
							} else if (value === "topics") {
								router.push(`/contacts/topics`);
							} else if (value === "groups") {
								router.push(`/contacts/groups`);
							} else {
								router.push(`/contacts`);
							}
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
