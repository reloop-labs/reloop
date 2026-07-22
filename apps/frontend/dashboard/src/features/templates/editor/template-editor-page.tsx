import { AnimatePresence, motion } from "framer-motion";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { CodeEditor } from "./code-view";
import { FullEmailBuilder } from "./editor";
import { EditorProvider } from "./editor-provider";
import {
	AIPanel,
	ScorePanel,
	TestPanel,
	VariablesPanel,
} from "./editor-sidebar-panels";
import { EditorToolbar } from "./editor-toolbar";
import { GeneratingOverlay } from "./generating-overlay";
import { EmailInspector } from "./inspector";
import { SendDetails } from "./send-details";
import { VersionSidebar } from "./version-sidebar";

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
		parseAsStringLiteral(viewModes).withDefault("visual"),
	);

	return (
		<EditorProvider key={templateId} roomId={templateId}>
			<div className="flex h-[calc(100vh-0px)] min-h-0 flex-1 items-stretch overflow-hidden pt-2 pr-2 pl-4">
				{/* Sidebar Editor Toolbar (Vertical, Left, Top-aligned) */}
				<div className="-ml-2 flex flex-col justify-start py-2">
					<EditorToolbar />
				</div>

				<div className="flex h-full flex-1 overflow-hidden">
					{/* Left panel (Code, history, or subpanels) */}
					<AnimatePresence initial={false}>
						{viewMode !== "visual" && (
							<motion.div
								initial={{ width: 0, opacity: 0 }}
								animate={{
									width: viewMode === "code" ? "50%" : "356px",
									opacity: 1,
								}}
								exit={{ width: 0, opacity: 0 }}
								transition={{
									type: "spring",
									stiffness: 320,
									damping: 33,
									opacity: { duration: 0.2 },
								}}
								className="relative flex shrink-0 overflow-hidden"
							>
								<div
									className="relative m-2 flex flex-1 overflow-hidden"
									style={{
										minWidth:
											viewMode === "code" ? "calc(50vw - 48px)" : "340px",
									}}
								>
									{viewMode === "ai" && (
										<AIPanel onClose={() => void setViewMode("visual")} />
									)}
									{viewMode === "code" && <CodeEditor />}
									{viewMode === "history" && <VersionSidebar />}
									{viewMode === "variables" && (
										<VariablesPanel
											onClose={() => void setViewMode("visual")}
										/>
									)}
									{viewMode === "score" && (
										<ScorePanel onClose={() => void setViewMode("visual")} />
									)}
									{viewMode === "test" && (
										<TestPanel onClose={() => void setViewMode("visual")} />
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Right panel (Visual builder + inspector) */}
					<div className="relative m-2 flex flex-1 overflow-hidden rounded-[24px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
						<main className="flex h-full flex-1 flex-col overflow-hidden">
							<SendDetails />
							<GeneratingOverlay />
							<div className="min-h-0 flex-1 overflow-y-auto py-4">
								<FullEmailBuilder />
							</div>
						</main>
						<AnimatePresence initial={false}>
							{viewMode === "visual" && (
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
									className="my-2 mr-2 h-[calc(100%-16px)] shrink-0 overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]"
								>
									<div className="h-full w-72 overflow-y-auto">
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
