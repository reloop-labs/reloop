"use client";

import { cn } from "@reloop/ui/cn";
import {
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useState,
} from "react";

type TabProps = {
	label: string;
	children: ReactNode;
};

export function Tab(_props: TabProps) {
	return null;
}

export function Tabs({ children }: { children: ReactNode }) {
	const tabs = Children.toArray(children).filter(
		isValidElement,
	) as ReactElement<TabProps>[];
	const [activeIndex, setActiveIndex] = useState(0);

	if (tabs.length === 0) {
		return null;
	}

	return (
		<div className="my-6 overflow-hidden rounded-xl border border-stroke-soft-200 dark:border-white/10">
			<div className="flex gap-1 border-stroke-soft-200 border-b bg-bg-weak-50 p-1 dark:border-white/10 dark:bg-white/[0.03]">
				{tabs.map((tab, index) => (
					<button
						key={tab.props.label}
						type="button"
						onClick={() => setActiveIndex(index)}
						className={cn(
							"rounded-lg px-3 py-1.5 font-medium text-[13px] transition-colors",
							activeIndex === index
								? "bg-bg-white-0 text-text-strong-950 dark:bg-white/10 dark:text-white"
								: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white",
						)}
					>
						{tab.props.label}
					</button>
				))}
			</div>
			<div className="p-4 text-[15px] leading-relaxed">
				{tabs[activeIndex]?.props.children}
			</div>
		</div>
	);
}
