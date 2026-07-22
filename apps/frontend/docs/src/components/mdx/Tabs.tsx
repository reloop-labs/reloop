"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState } from "react";
import {
	isDocsViewModeTabs,
	resolveDocsViewModeValue,
	useDocsViewMode,
	valueToDocsViewMode,
} from "@reloop/fe-docs/lib/use-docs-view-mode";

export type TabProps = {
	title: string;
	icon?: string;
	children?: React.ReactNode;
};

/** Marker component — props are read by `Tabs`; content is rendered in panels. */
export function Tab(_props: TabProps) {
	return null;
}

function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^\w\- ]+/g, "")
		.replace(/\s+/g, "-");
}

type TabItem = {
	value: string;
	title: string;
	icon?: string;
	content: React.ReactNode;
};

function collectTabItems(children: React.ReactNode): TabItem[] {
	const items: TabItem[] = [];
	const seen = new Map<string, number>();

	React.Children.forEach(children, (child) => {
		if (!React.isValidElement(child)) return;

		const props = child.props as TabProps;
		if (typeof props.title !== "string") return;

		const base = slugify(props.title) || "tab";
		const count = seen.get(base) ?? 0;
		seen.set(base, count + 1);
		const value = count === 0 ? base : `${base}-${count}`;

		items.push({
			value,
			title: props.title,
			icon: props.icon,
			content: props.children,
		});
	});

	return items;
}

function TabsShell({
	items,
	value,
	onValueChange,
}: {
	items: TabItem[];
	value: string;
	onValueChange: (value: string) => void;
}) {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const effectiveValue =
		items.some((item) => item.value === value) ? value : items[0].value;
	const activeIndex = items.findIndex((item) => item.value === effectiveValue);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	return (
		<TabMenuHorizontal.Root
			value={effectiveValue}
			onValueChange={onValueChange}
			className="my-6"
		>
			<TabMenuHorizontal.List className="relative h-10 gap-0 border-b! py-0">
				{items.map(({ value: itemValue, title, icon }, index) => (
					<TabMenuHorizontal.Trigger
						ref={(el) => {
							buttonRefs.current[index] = el;
						}}
						onPointerEnter={() => setHoveredIdx(index)}
						onPointerLeave={() => setHoveredIdx(undefined)}
						className={cn(
							"flex cursor-pointer items-center gap-2 px-2.5 py-0! font-medium text-sm",
							hoveredIdx === undefined &&
								activeIndex === index &&
								"text-text-strong-950",
						)}
						key={itemValue}
						value={itemValue}
					>
						{icon ?
							<Icon name={icon} className="h-4 w-4" />
						:	null}
						{title}
					</TabMenuHorizontal.Trigger>
				))}
				<AnimatePresence>
					{rect && activeIndex !== -1 ?
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
							exit={{ opacity: 0 }}
							transition={{ duration: 0.14 }}
						/>
					:	null}
				</AnimatePresence>
			</TabMenuHorizontal.List>

			{items.map(({ value: itemValue, content }) => (
				<TabMenuHorizontal.Content
					key={itemValue}
					value={itemValue}
					className="mt-4 outline-none"
				>
					{content}
				</TabMenuHorizontal.Content>
			))}
		</TabMenuHorizontal.Root>
	);
}

function SyncedViewModeTabs({ items }: { items: TabItem[] }) {
	const [viewMode, setViewMode] = useDocsViewMode();
	const values = items.map((item) => item.value);
	const effectiveValue = resolveDocsViewModeValue(
		values,
		viewMode,
		items[0].value,
	);

	return (
		<TabsShell
			items={items}
			value={effectiveValue}
			onValueChange={(next) => {
				const mode = valueToDocsViewMode(next);
				if (mode) setViewMode(mode);
			}}
		/>
	);
}

function LocalTabs({ items }: { items: TabItem[] }) {
	const [activeValue, setActiveValue] = useState(items[0]?.value ?? "");

	return (
		<TabsShell
			items={items}
			value={activeValue}
			onValueChange={setActiveValue}
		/>
	);
}

export function Tabs({ children }: { children?: React.ReactNode }) {
	const items = collectTabItems(children);
	if (items.length === 0) return null;

	const values = items.map((item) => item.value);
	if (isDocsViewModeTabs(values)) {
		return <SyncedViewModeTabs items={items} />;
	}

	return <LocalTabs items={items} />;
}
