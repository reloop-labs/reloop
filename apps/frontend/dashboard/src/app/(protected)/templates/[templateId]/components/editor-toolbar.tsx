"use client";

import { cn } from "@reloop/ui/cn";
import * as Tooltip from "@reloop/ui/tooltip";
import { Award, Braces, Brush, Code2, History, Send } from "lucide-react";
import { useEditorStore } from "./use-editor-store";

export function EditorToolbar() {
	const { viewMode, setViewMode } = useEditorStore();

	return (
		<div className="flex flex-col gap-1.5 p-1">
			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						onClick={() => setViewMode("visual")}
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:scale-105 active:scale-95",
							viewMode === "visual"
								? "bg-bg-soft-200 text-text-strong-950 dark:bg-zinc-800 dark:text-white"
								: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
						)}
					>
						<Brush className="h-4 w-4" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="right" sideOffset={8}>
					Design mode
				</Tooltip.Content>
			</Tooltip.Root>

			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						onClick={() => setViewMode("code")}
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:scale-105 active:scale-95",
							viewMode === "code"
								? "bg-bg-soft-200 text-text-strong-950 dark:bg-zinc-800 dark:text-white"
								: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
						)}
					>
						<Code2 className="h-4 w-4" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="right" sideOffset={8}>
					Split view / Code editor
				</Tooltip.Content>
			</Tooltip.Root>

			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						onClick={() => setViewMode("variables")}
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:scale-105 active:scale-95",
							viewMode === "variables"
								? "bg-bg-soft-200 text-text-strong-950 dark:bg-zinc-800 dark:text-white"
								: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
						)}
					>
						<Braces className="h-4 w-4" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="right" sideOffset={8}>
					Variables
				</Tooltip.Content>
			</Tooltip.Root>

			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						onClick={() => setViewMode("history")}
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:scale-105 active:scale-95",
							viewMode === "history"
								? "bg-bg-soft-200 text-text-strong-950 dark:bg-zinc-800 dark:text-white"
								: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
						)}
					>
						<History className="h-4 w-4" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="right" sideOffset={8}>
					Version history
				</Tooltip.Content>
			</Tooltip.Root>

			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						onClick={() => setViewMode("test")}
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:scale-105 active:scale-95",
							viewMode === "test"
								? "bg-bg-soft-200 text-text-strong-950 dark:bg-zinc-800 dark:text-white"
								: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
						)}
					>
						<Send className="h-4 w-4" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="right" sideOffset={8}>
					Send test email
				</Tooltip.Content>
			</Tooltip.Root>

			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						onClick={() => setViewMode("score")}
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:scale-105 active:scale-95",
							viewMode === "score"
								? "bg-bg-soft-200 text-text-strong-950 dark:bg-zinc-800 dark:text-white"
								: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
						)}
					>
						<Award className="h-4 w-4" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="right" sideOffset={8}>
					Template score
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	);
}
