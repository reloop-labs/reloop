import type { SlashCommandItem } from "@react-email/editor/ui";
import { cn } from "@reloop/ui/cn";
import { useCurrentEditor } from "@tiptap/react";
import React from "react";
import { groupWidgetSections, runSlashCommand } from "../lib/slash-commands";

function WidgetIcon({ item }: { item: SlashCommandItem }) {
	const colorClass = "text-text-sub-600";
	if (typeof item.icon === "function") {
		const IconCmp = item.icon as React.ComponentType<{
			size?: number;
			className?: string;
		}>;
		return <IconCmp size={18} className={colorClass} />;
	}
	if (React.isValidElement<{ className?: string; size?: number }>(item.icon)) {
		return React.cloneElement(item.icon, {
			size: 18,
			className: cn(item.icon.props.className, "h-[18px] w-[18px]", colorClass),
		});
	}
	return item.icon;
}

export function BlockPalette() {
	const { editor } = useCurrentEditor();

	const insert = (item: SlashCommandItem) => {
		if (!editor) return;
		try {
			runSlashCommand(editor, item);
		} catch (error) {
			console.error("Failed to insert block", error);
		}
	};

	return (
		<div className="flex h-full w-full min-h-0 flex-1 flex-col">
			<div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-4">
				{groupWidgetSections().map((group) => (
					<section key={group.category} className="mb-5 last:mb-0">
						<h3 className="px-0.5 pb-2 font-semibold text-[11px] text-text-soft-400 uppercase tracking-wide">
							{group.category}
						</h3>
						<ul className="grid w-full grid-cols-2 gap-2">
							{group.items.map((item) => (
								<li key={item.title}>
									<button
										type="button"
										title={item.description}
										onMouseDown={(e) => {
											e.preventDefault();
										}}
										onClick={() => insert(item)}
										className={cn(
											"flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2 py-2.5",
											"text-center font-medium text-[11px] text-text-strong-950",
											"transition-[border-color,background-color,transform] duration-150 ease-out",
											"hover:border-stroke-soft-300 hover:bg-bg-weak-50/50",
											"active:scale-[0.97]",
											"dark:border-stroke-soft-100/40 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]",
										)}
									>
										<span className="flex size-6 items-center justify-center">
											<WidgetIcon item={item} />
										</span>
										<span className="line-clamp-2 leading-tight">
											{item.title}
										</span>
									</button>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</div>
	);
}
