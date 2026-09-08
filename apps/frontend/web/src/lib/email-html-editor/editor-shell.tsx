"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { EditorContext } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { EmailHtmlCanvas } from "./canvas";
import { EmailHtmlCodeEditor } from "./code-editor";
import { EmailInspector } from "./inspector";
import { loadHtmlIntoEditor } from "./load-html-into-editor";
import { useEmailHtmlEditor } from "./use-email-html-editor";

export function EmailHtmlEditorShell({ initialHtml }: { initialHtml: string }) {
	const editor = useEmailHtmlEditor();
	const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
	const isCodeSplit = viewMode === "code";

	useEffect(() => {
		if (!editor || !initialHtml.trim()) return;
		loadHtmlIntoEditor(editor, initialHtml);
	}, [editor, initialHtml]);

	return (
		<EditorContext.Provider value={{ editor }}>
			<Toaster position="bottom-center" />
			<div className="flex h-[min(78vh,52rem)] min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black">
				<div className="flex h-11 shrink-0 items-center justify-between border-stroke-soft-200 border-b px-3 dark:border-white/10">
					<p className="font-medium text-[13px] text-text-sub-600 dark:text-white/50">
						{isCodeSplit
							? "Source and canvas stay in sync"
							: "Select a block to inspect"}
					</p>
					<div className="flex items-center gap-0.5 rounded-[10px] border border-stroke-soft-100 bg-bg-weak-50/80 p-0.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.06]">
						<button
							type="button"
							title="Visual editor"
							aria-label="Visual editor"
							onClick={() => setViewMode("visual")}
							className={cn(
								"flex h-7 w-7 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]",
								!isCodeSplit
									? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs dark:bg-white/12 dark:text-white"
									: "text-text-sub-600 hover:text-text-strong-950 dark:hover:text-white",
							)}
						>
							<Icon name="pencil" className="h-3.5 w-3.5" />
						</button>
						<button
							type="button"
							title="Code editor"
							aria-label="Code editor"
							onClick={() => setViewMode("code")}
							className={cn(
								"flex h-7 w-7 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]",
								isCodeSplit
									? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs dark:bg-white/12 dark:text-white"
									: "text-text-sub-600 hover:text-text-strong-950 dark:hover:text-white",
							)}
						>
							<Icon name="code" className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
				<div className="flex min-h-0 flex-1 overflow-hidden">
					{isCodeSplit ? (
						<div className="relative flex w-1/2 min-w-[18rem] shrink-0 flex-col overflow-hidden border-stroke-soft-200 border-r dark:border-white/10">
							<EmailHtmlCodeEditor onClose={() => setViewMode("visual")} />
						</div>
					) : null}
					<div className="relative flex min-h-0 flex-1 overflow-hidden">
						<main
							className={cn(
								"min-h-0 flex-1 overflow-auto bg-[#f4f4f5] dark:bg-neutral-950",
								!isCodeSplit && "pr-72",
							)}
						>
							<EmailHtmlCanvas />
						</main>
						{!isCodeSplit ? (
							<aside className="absolute inset-y-0 right-0 z-10 flex h-full w-72 shrink-0 flex-col overflow-y-auto overflow-x-hidden border-stroke-soft-200 border-l bg-bg-white-0 dark:border-white/10 dark:bg-black">
								<EmailInspector />
							</aside>
						) : null}
					</div>
				</div>
			</div>
		</EditorContext.Provider>
	);
}
