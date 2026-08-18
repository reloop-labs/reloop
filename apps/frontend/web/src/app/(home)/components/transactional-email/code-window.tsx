"use client";

import { cn } from "@reloop/ui/cn";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export type CodeTab = {
	id: string;
	label: string;
};

function TypeScriptIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<rect width="24" height="24" rx="4" fill="#3178C6" />
			<path
				d="M11.2 9H6.8V10.6H8.2V17H9.8V10.6H11.2V9ZM13.8 14.8C14.2 15.3 14.8 15.6 15.5 15.6C16.2 15.6 16.7 15.2 16.7 14.7C16.7 14.2 16.3 13.9 15.5 13.5L14.8 13.2C13.7 12.7 12.9 12 12.9 10.8C12.9 9.5 14 8.5 15.5 8.5C16.5 8.5 17.3 8.9 17.9 9.5L16.8 10.7C16.4 10.3 16 10.1 15.5 10.1C14.9 10.1 14.5 10.4 14.5 10.8C14.5 11.2 14.8 11.5 15.6 11.8L16.2 12.1C17.5 12.6 18.3 13.3 18.3 14.6C18.3 16 17.1 17.1 15.5 17.1C14.3 17.1 13.2 16.5 12.6 15.7L13.8 14.8Z"
				fill="white"
			/>
		</svg>
	);
}

export function CodeWindow({
	file,
	tabs,
	activeTab,
	onTabChange,
	children,
}: {
	file?: string;
	tabs?: readonly CodeTab[];
	activeTab?: string;
	onTabChange?: (id: string) => void;
	children: ReactNode;
}) {
	const shouldReduceMotion = useReducedMotion();

	return (
		<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#161616] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
			<div className="relative flex h-11 items-end justify-between border-stroke-soft-200 border-b bg-[#eaedf1] px-3.5 dark:border-white/10 dark:bg-[#0e0e0e]">
				<div className="flex items-center gap-3 overflow-hidden">
					{/* Window control dots */}
					<div className="flex shrink-0 items-center gap-1.5 pb-2.5">
						<span className="size-2.5 rounded-full bg-[#ff5f57]" />
						<span className="size-2.5 rounded-full bg-[#febc2e]" />
						<span className="size-2.5 rounded-full bg-[#28c840]" />
					</div>

					{/* Chrome-style Tab Strip */}
					<div className="flex items-end gap-1 overflow-x-auto scrollbar-none">
						{tabs && tabs.length > 0 ? (
							tabs.map((tab) => {
								const selected = tab.id === (activeTab ?? tabs[0]?.id);
								return (
									<button
										key={tab.id}
										type="button"
										onClick={() => onTabChange?.(tab.id)}
										className={cn(
											"group relative -mb-px flex h-8 items-center gap-2 rounded-t-[9px] px-3 font-medium font-mono text-[12px] transition-colors",
											selected
												? "border-stroke-soft-200 border-t border-r border-l bg-bg-white-0 text-text-strong-950 shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[#161616] dark:text-white"
												: "text-text-sub-600 hover:bg-black/[0.04] hover:text-text-strong-950 dark:text-white/45 dark:hover:bg-white/[0.04] dark:hover:text-white",
										)}
									>
										{selected && (
											<motion.span
												layoutId={
													shouldReduceMotion
														? undefined
														: "code-window-chrome-tab-indicator"
												}
												className="pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-[9px] bg-primary-base"
												transition={
													shouldReduceMotion
														? { duration: 0 }
														: {
																type: "spring",
																bounce: 0,
																duration: 0.24,
															}
												}
											/>
										)}
										<TypeScriptIcon className="size-3.5 shrink-0 rounded-[2.5px]" />
										<span className="truncate">{tab.label}</span>
									</button>
								);
							})
						) : (
							<div className="-mb-px flex h-8 items-center gap-2 rounded-t-[9px] border-stroke-soft-200 border-t border-r border-l bg-bg-white-0 px-3 font-medium font-mono text-[12px] text-text-strong-950 shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[#161616] dark:text-white">
								<TypeScriptIcon className="size-3.5 shrink-0 rounded-[2.5px]" />
								<span className="truncate">{file}</span>
							</div>
						)}
					</div>
				</div>
			</div>
			<pre className="overflow-hidden px-5 py-5 font-mono text-[12.5px] leading-6 sm:text-[13px]">
				{children}
			</pre>
		</div>
	);
}
