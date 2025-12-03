"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const languages = [
	{ id: "nodejs", name: "Node.js", icon: "nodejs", iconSize: "h-4 w-4" },
	{
		id: "go",
		name: "Go",
		icon: "go",
		iconSize: "h-6 w-6",
		iconClass: "fill-bg-white-0 ",
	},
	{
		id: "php",
		name: "PHP",
		icon: "php",
		iconSize: "h-6 w-6",
		iconClass: "fill-bg-white-0 ",
	},
	{ id: "python", name: "Python", icon: "python", iconSize: "h-4 w-4" },
];

interface LanguageTabsProps {
	defaultValue?: string;
	onValueChange?: (value: string) => void;
}

export const LanguageTabs = ({
	defaultValue = "nodejs",
	onValueChange,
}: LanguageTabsProps) => {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const [selectedLang, setSelectedLang] = useState<string>(defaultValue);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const activeIndex = languages.findIndex((lang) => lang.id === selectedLang);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	const handleClick = (langId: string) => {
		setSelectedLang(langId);
		onValueChange?.(langId);
	};

	return (
		<TabMenuHorizontal.Root defaultValue={defaultValue} value={selectedLang}>
			<TabMenuHorizontal.List className="relative h-10 gap-0 border-b! px-3 py-0">
				{languages.map((lang, index) => (
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
						key={lang.id}
						value={lang.id}
						onClick={() => handleClick(lang.id)}
					>
						<span className="text-base">
							<Icon
								name={lang.icon}
								className={cn(lang.iconSize, lang.iconClass)}
							/>
						</span>
						<span className="text-text-soft-400 text-xs">{lang.name}</span>
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
