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
					<button
						type="button"
						onClick={() =>
							setViewMode((mode) => (mode === "code" ? "visual" : "code"))
						}
						className={cn(
							"inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-medium text-[12px] transition-colors",
							isCodeSplit
								? "bg-bg-strong-950 text-white dark:bg-white dark:text-black"
								: "bg-bg-weak-50 text-text-sub-600 hover:text-text-strong-950 dark:bg-white/8 dark:text-white/70",
						)}
					>
						<Icon name="code" className="h-3.5 w-3.5" />
						{"<>"}
					</button>
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
