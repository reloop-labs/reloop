"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const list = [
	{
		title: "Genera",
		path: "/settings",
		iconName: "gear",
	},
	{
		title: "Team",
		path: "/settings/team",
		iconName: "users",
	},
	{
		title: "Security",
		path: "/settings/security",
		iconName: "shield-check",
	},
	{
		title: "Appearance",
		path: "/settings/appearance",
		iconName: "swatch-book",
	},
];

export const SideBar = () => {
	const [idx, setIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLAnchorElement[]>([]);
	const pathname = usePathname();
	const pathWithoutSlug = pathname.replace(/^\/[^/]+/, "") || "/";
	const activeIndex = list.findIndex((item) => item.path === pathWithoutSlug);
	const { activeOrganization } = useUserOrganization();
	const currentIdx = idx !== undefined ? idx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	return (
		<div>
			<div className="sticky top-24 z-10 flex w-64 flex-col gap-2 pt-5">
				<div className="relative">
					{list.map(({ path, title, iconName }, index) => {
						return (
							<Link
								key={path + index}
								href={`/${activeOrganization.slug}${path}`}
								ref={(el) => {
									if (el) {
										buttonRefs.current[index] = el;
									}
								}}
								onPointerEnter={() => setIdx(index)}
								onPointerLeave={() => setIdx(undefined)}
								className={cn(
									"flex h-12 items-center justify-start gap-2 px-4 text-left",
									!rect &&
										currentIdx === index &&
										"rounded-lg bg-neutral-alpha-10",
								)}
							>
								<Icon name={iconName} className="h-4 w-4" />
								<span>{title}</span>
							</Link>
						);
					})}
					<AnimatePresence>
						{rect ? (
							<motion.div
								className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
								initial={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0),
									opacity: 0,
								}}
								animate={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0),
									opacity: 1,
								}}
								exit={{
									pointerEvents: "none",
									opacity: 0,
									width: rect.width,
									height: rect.height,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0),
								}}
								transition={{ duration: 0.14 }}
							/>
						) : null}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
};
