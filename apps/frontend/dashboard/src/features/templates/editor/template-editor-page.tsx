import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "motion/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { AIPanel } from "./ai/ai-panel";
import { FullEmailBuilder } from "./components/canvas/email-builder";
import { GeneratingOverlay } from "./components/canvas/generating-overlay";
import { CodeEditor } from "./components/panels/code/code-view";
import { VersionSidebar } from "./components/panels/history/version-sidebar";
import { ScorePanel } from "./components/panels/score/score-panel";
import { TestPanel } from "./components/panels/test/test-panel";
import { VariablesPanel } from "./components/panels/variables/variables-panel";
import { SendDetails } from "./components/send-details/send-details";
import { EmailInspector } from "./inspector";
import { EditorProvider } from "./providers/editor-provider";

const viewModes = [
	"visual",
	"ai",
	"code",
	"history",
	"variables",
	"score",
	"test",
] as const;

export function TemplateEditorPage({ templateId }: { templateId: string }) {
	const [viewMode, setViewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(viewModes).withDefault("ai"),
	);

	const isCodeSplit = viewMode === "code";

	return (
		<EditorProvider key={templateId} roomId={templateId}>
			<div className="flex h-full min-h-0 flex-1 items-stretch overflow-hidden bg-bg-white-0 dark:bg-black">
				<div className="flex h-full min-h-0 flex-1 overflow-hidden">
					{/* Left panel / Sidebar (Chat by default, or Code/History/Variables/Score/Test) */}
					<div
						className={cn(
							"relative flex shrink-0 overflow-hidden border-stroke-soft-200 border-r transition-all duration-300 dark:border-stroke-soft-100/40",
							isCodeSplit ? "w-1/2 min-w-[480px]" : "w-[360px]",
						)}
					>
						{viewMode === "code" && (
							<CodeEditor onClose={() => void setViewMode("ai")} />
						)}
						{viewMode === "history" && <VersionSidebar />}
						{viewMode === "variables" && (
							<VariablesPanel onClose={() => void setViewMode("ai")} />
						)}
						{viewMode === "score" && (
							<ScorePanel onClose={() => void setViewMode("ai")} />
						)}
						{viewMode === "test" && (
							<TestPanel onClose={() => void setViewMode("ai")} />
						)}
						{(viewMode === "ai" || viewMode === "visual") && <AIPanel />}
					</div>

					{/* Center/Right panel (Visual builder + inspector) */}
					<div className="relative flex min-h-0 flex-1 overflow-hidden bg-bg-white-0 dark:bg-black">
						<main className="flex h-full flex-1 flex-col overflow-hidden">
							<SendDetails />
							<GeneratingOverlay />
							<div className="min-h-0 flex-1 overflow-y-auto py-4">
								<FullEmailBuilder />
							</div>
						</main>
						<AnimatePresence initial={false}>
							{!isCodeSplit && (
								<motion.div
									initial={{ width: 0, opacity: 0 }}
									animate={{ width: "288px", opacity: 1 }}
									exit={{ width: 0, opacity: 0 }}
									transition={{
										type: "spring",
										stiffness: 320,
										damping: 33,
										opacity: { duration: 0.2 },
									}}
									className="h-full shrink-0 overflow-hidden border-stroke-soft-200 border-l bg-transparent dark:border-stroke-soft-100/40"
								>
									<div className="h-full w-72 overflow-y-auto overflow-x-hidden">
										<EmailInspector />
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</EditorProvider>
	);
}
