"use client";

import { cn } from "@reloop/ui/cn";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
	filterSlashCommands,
	type SlashCommandItem,
} from "./slash-command-items";

export type SlashCommandMenuHandle = {
	onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type SlashCommandMenuProps = {
	items: SlashCommandItem[];
	command: (item: SlashCommandItem) => void;
	query?: string;
};

export const SlashCommandMenu = forwardRef<
	SlashCommandMenuHandle,
	SlashCommandMenuProps
>(function SlashCommandMenu({ items, command, query = "" }, ref) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const filtered = items.length > 0 ? items : filterSlashCommands(query);

	useEffect(() => {
		setSelectedIndex(0);
	}, [query, filtered.length]);

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (filtered.length === 0) return false;

			if (event.key === "ArrowDown") {
				setSelectedIndex((i) => (i + 1) % filtered.length);
				return true;
			}
			if (event.key === "ArrowUp") {
				setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
				return true;
			}
			if (event.key === "Enter") {
				const item = filtered[selectedIndex];
				if (item) command(item);
				return true;
			}
			return false;
		},
	}));

	if (filtered.length === 0) {
		return (
			<div className="z-[100] min-w-[260px] rounded-md border border-[#E7E7E7] bg-white px-3 py-2 text-mail-muted text-xs shadow-md dark:border-[#2B2B2B] dark:bg-[#202020]">
				No results
			</div>
		);
	}

	return (
		<div className="z-[100] max-h-[330px] min-w-[280px] overflow-y-auto rounded-md border border-[#E7E7E7] bg-white px-1 py-2 shadow-md dark:border-[#2B2B2B] dark:bg-[#202020]">
			<div className="px-2 pb-1 font-medium text-[10px] text-mail-muted uppercase tracking-wider">
				Commands
			</div>
			{filtered.map((item, index) => (
				<button
					key={item.title}
					type="button"
					onMouseDown={(e) => {
						e.preventDefault();
						command(item);
					}}
					onMouseEnter={() => setSelectedIndex(index)}
					className={cn(
						"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
						index === selectedIndex
							? "bg-[var(--inbox-hover)]"
							: "hover:bg-[var(--inbox-hover)]",
					)}
				>
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E7E7E7] bg-white text-mail-foreground dark:border-[#2B2B2B] dark:bg-[#181818]">
						{item.icon}
					</div>
					<div className="min-w-0 flex-1">
						<p className="font-medium text-mail-foreground text-xs">
							{item.title}
						</p>
						<p className="truncate text-[10px] text-mail-muted">
							{item.description}
						</p>
					</div>
				</button>
			))}
		</div>
	);
});
