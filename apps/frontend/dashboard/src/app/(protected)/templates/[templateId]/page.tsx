"use client";

import { useParams } from "next/navigation";
import { FullEmailBuilder } from "./components/editor";
import { EditorProvider } from "./components/editor-provider";
import { GeneratingOverlay } from "./components/generating-overlay";
import { EmailInspector } from "./components/inspector";
import { SendDetails } from "./components/send-details";
import { VersionSidebar } from "./components/version-sidebar";
import { CodeEditor } from "./components/code-view";
import { useEditorStore } from "./components/use-editor-store";
import { VariablesPanel, ScorePanel, TestPanel } from "./components/editor-sidebar-panels";
import * as Tooltip from "@reloop/ui/tooltip";
import { Layout, Code, History, Braces, Award, Send } from "lucide-react";
import { cn } from "@reloop/ui/cn";

const Page = () => {
	const params = useParams<{ templateId: string }>();
	const templateId = params.templateId;
	const { viewMode, setViewMode } = useEditorStore();

	return (
		<EditorProvider key={templateId} roomId={templateId}>
			<div className="flex h-[calc(100vh-45px)] overflow-hidden">
				<div className="relative m-2 flex flex-1 overflow-hidden rounded-[24px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					<div className="relative flex flex-1 overflow-hidden">
						{/* Floating View Mode & History Toggles */}
						<div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-sm dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<button
										type="button"
										onClick={() => setViewMode("visual")}
										className={cn(
											"flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:scale-105 active:scale-95",
											viewMode === "visual"
												? "bg-bg-soft-200 text-text-strong-950 dark:bg-zinc-800 dark:text-white"
												: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
										)}
									>
										<Layout size={15} />
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
												: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
										)}
									>
										<Code size={15} />
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
												: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
										)}
									>
										<Braces size={15} />
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
												: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
										)}
									>
										<History size={16} />
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
												: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
										)}
									>
										<Send size={15} />
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
												: "text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
										)}
									>
										<Award size={15} />
									</button>
								</Tooltip.Trigger>
								<Tooltip.Content side="right" sideOffset={8}>
									Template score
								</Tooltip.Content>
							</Tooltip.Root>
						</div>

						{viewMode !== "visual" ? (
							<div className="flex flex-1 overflow-hidden h-full">
								{/* Left side: Code Editor, History or Subpanels */}
								<div className="w-1/2 border-r border-stroke-soft-200 dark:border-stroke-soft-100/40 h-full flex flex-col bg-zinc-950">
									{viewMode === "code" && <CodeEditor />}
									{viewMode === "history" && <VersionSidebar />}
									{viewMode === "variables" && <VariablesPanel onClose={() => setViewMode("visual")} />}
									{viewMode === "score" && <ScorePanel onClose={() => setViewMode("visual")} />}
									{viewMode === "test" && <TestPanel onClose={() => setViewMode("visual")} />}
								</div>
								{/* Right side: Visual Editor & Send Details */}
								<main className="w-1/2 hide-scrollbar overflow-y-auto flex flex-col h-full bg-bg-white-0 dark:bg-[#0a0a0a]">
									<SendDetails />
									<GeneratingOverlay />
									<FullEmailBuilder />
								</main>
							</div>
						) : (
							<main className="hide-scrollbar flex-1 overflow-y-auto flex flex-col h-full">
								<SendDetails />
								<GeneratingOverlay />
								<FullEmailBuilder />
							</main>
						)}
					</div>
					<div className="m-2 h-[calc(100vh-79px)] w-72 shrink-0 overflow-y-auto rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
						<EmailInspector />
					</div>
				</div>
			</div>
		</EditorProvider>
	);
};

export default Page;
