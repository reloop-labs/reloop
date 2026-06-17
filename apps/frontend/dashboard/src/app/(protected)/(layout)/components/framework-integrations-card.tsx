"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import {
	siDjango,
	siExpress,
	siFastapi,
	siFlask,
	siGo,
	siHono,
	siLaravel,
	siNestjs,
	siNextdotjs,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRubyonrails,
	siRust,
	siSymfony,
} from "simple-icons";

type LanguageId = "nodejs" | "python" | "go" | "rust" | "ruby" | "php";

const languages = [
	{ id: "nodejs" as const, title: "Node.js", icon: siNodedotjs },
	{ id: "python" as const, title: "Python", icon: siPython },
	{ id: "go" as const, title: "Go", icon: siGo },
	{ id: "rust" as const, title: "Rust", icon: siRust },
	{ id: "ruby" as const, title: "Ruby", icon: siRuby },
	{ id: "php" as const, title: "PHP", icon: siPhp },
];

const frameworkIntegrations: Record<LanguageId, { name: string; icon: any }[]> =
	{
		nodejs: [
			{ name: "Next.js App Router", icon: siNextdotjs },
			{ name: "Express REST API", icon: siExpress },
			{ name: "NestJS Module", icon: siNestjs },
			{ name: "Hono Middleware", icon: siHono },
		],
		python: [
			{ name: "FastAPI", icon: siFastapi },
			{ name: "Django", icon: siDjango },
			{ name: "Flask", icon: siFlask },
		],
		go: [
			{ name: "Gin Gonic", icon: siGo },
			{ name: "Go Fiber", icon: siGo },
		],
		rust: [
			{ name: "Axum Web Framework", icon: siRust },
			{ name: "Actix Web", icon: siRust },
		],
		ruby: [
			{ name: "Ruby on Rails", icon: siRubyonrails },
			{ name: "Sinatra", icon: siRuby },
		],
		php: [
			{ name: "Laravel", icon: siLaravel },
			{ name: "Symfony", icon: siSymfony },
		],
	};

export function FrameworkIntegrationsCard() {
	const [activeTab, setActiveTab] = useState<LanguageId>("nodejs");
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);

	const activeIndex = languages.findIndex((item) => item.id === activeTab);
	const activeFrameworks = frameworkIntegrations[activeTab];

	return (
		<div className="group flex w-full flex-col">
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<span className="flex items-center gap-2 font-medium text-sm text-text-sub-600 dark:text-white/60">
					<Icon name="modules" className="h-4 w-4 shrink-0" />
					<span>Framework Integrations</span>
				</span>
			</div>

			<div className="-mt-1.5 rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
				{/* Tab Selector */}
				<div className="flex shrink-0 overflow-x-auto overflow-y-hidden border-stroke-soft-100/50 border-b px-4 [-ms-overflow-style:none] [scrollbar-width:none] dark:border-white/5 [&::-webkit-scrollbar]:hidden">
					<TabMenuHorizontal.Root value={activeTab} className="w-full">
						<TabMenuHorizontal.List className="relative h-12 w-full justify-start gap-0 overflow-x-auto overflow-y-hidden border-b-0 py-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>div:last-child]:h-0.5 [&>div:last-child]:-bottom-px">
							{languages.map(({ id, title, icon }, index) => {
								const isHovered = hoveredIdx === index;
								const isActive = activeIndex === index && hoveredIdx === undefined;

								return (
									<TabMenuHorizontal.Trigger
										key={id}
										value={id}
										onPointerEnter={() => setHoveredIdx(index)}
										onPointerLeave={() => setHoveredIdx(undefined)}
										className={cn(
											"relative flex h-12 cursor-pointer items-center gap-2 px-3.5 py-0! font-medium text-xs transition-colors isolate",
											hoveredIdx === undefined && activeIndex === index
												? "text-text-strong-950 dark:text-white"
												: "text-text-sub-600 dark:text-white/60",
										)}
										onClick={() => setActiveTab(id)}
									>
										{(isHovered || isActive) && (
											<motion.div
												layoutId="framework-active-pill"
												className="absolute inset-x-1.5 top-2.5 bottom-2.5 -z-10 rounded-lg bg-neutral-alpha-10 dark:bg-white/10"
												transition={{
													type: "spring",
													stiffness: 380,
													damping: 30,
												}}
											/>
										)}
										<svg
											role="img"
											viewBox="0 0 24 24"
											className="h-3.5 w-3.5 shrink-0"
											fill="currentColor"
											xmlns="http://www.w3.org/2000/svg"
											style={{ color: `#${icon.hex}` }}
										>
											<path d={icon.path} />
										</svg>
										{title}
									</TabMenuHorizontal.Trigger>
								);
							})}
						</TabMenuHorizontal.List>
					</TabMenuHorizontal.Root>
				</div>

				{/* List */}
				<div className="p-4">
					<div className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2 lg:grid-cols-1">
						{activeFrameworks.map((item) => (
							<div
								key={item.name}
								className="group/tile flex cursor-pointer items-center gap-2.5 border-stroke-soft-100/50 border-b py-1 transition-colors last:border-b-0 dark:border-white/5"
							>
								<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded">
									<svg
										role="img"
										viewBox="0 0 24 24"
										className="h-4 w-4 shrink-0"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
										style={{ color: `#${item.icon.hex}` }}
									>
										<path d={item.icon.path} />
									</svg>
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-1">
										<span className="font-semibold text-text-strong-950 text-xs group-hover/tile:underline dark:text-white">
											{item.name}
										</span>
										<ArrowRight className="h-3 w-3 shrink-0 text-text-sub-400 opacity-0 transition-all group-hover/tile:text-text-strong-950 group-hover/tile:opacity-100" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
