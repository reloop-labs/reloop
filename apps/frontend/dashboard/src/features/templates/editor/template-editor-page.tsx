"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { FullEmailBuilder } from "./components/canvas/email-builder";
import { GeneratingOverlay } from "./components/canvas/generating-overlay";
import { HtmlEmailPreview } from "./components/canvas/html-preview";
import { CodeEditor } from "./components/panels/code/code-view";
import { VersionSidebar } from "./components/panels/history/version-sidebar";
import { VariablesPanel } from "./components/panels/variables/variables-panel";
import { SendDetails } from "./components/send-details/send-details";
import { TemplateInspectorTabs } from "./components/template-inspector-tabs";
import { useEditorStore } from "./hooks/use-editor-store";
import { EmailInspector } from "./inspector";
import { EditorProvider } from "./providers/editor-provider";

const viewModes = ["visual", "code", "history", "variables"] as const;

const TAB_ORDER: Record<string, number> = {
	visual: 0,
	variables: 1,
	history: 2,
};

export function TemplateEditorPage({ templateId }: { templateId: string }) {
	const shouldReduceMotion = useReducedMotion();
	const [viewMode, setViewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(viewModes).withDefault("visual"),
	);

	const isCodeSplit = viewMode === "code";
	const htmlLocked = useEditorStore((s) => s.htmlLocked);
	const codeHtml = useEditorStore((s) => s.codeHtml);
	const showHtmlCanvas = Boolean((htmlLocked || isCodeSplit) && codeHtml.trim());
	const currentTab =
		viewMode === "variables"
			? "variables"
			: viewMode === "history"
				? "history"
				: "visual";

	const [_prevTab, setPrevTab] = useState(currentTab);
	const [direction, setDirection] = useState(1);

	const handleSelectTab = (tab: "visual" | "variables" | "history") => {
		const prevIndex = TAB_ORDER[currentTab] ?? 0;
		const nextIndex = TAB_ORDER[tab] ?? 0;
		setDirection(nextIndex >= prevIndex ? 1 : -1);
		setPrevTab(currentTab);
		void setViewMode(tab);
	};

	const slideVariants = {
		enter: (dir: number) => ({
			transform: shouldReduceMotion
				? "translateX(0%)"
				: dir > 0
					? "translateX(20%)"
					: "translateX(-20%)",
			opacity: 0,
		}),
		center: {
			transform: "translateX(0%)",
			opacity: 1,
		},
		exit: (dir: number) => ({
			transform: shouldReduceMotion
				? "translateX(0%)"
				: dir > 0
					? "translateX(-20%)"
					: "translateX(20%)",
			opacity: 0,
		}),
	};

	return (
		<EditorProvider key={templateId} roomId={templateId}>
			<div className="flex h-full min-h-0 flex-1 items-stretch overflow-hidden bg-bg-white-0 dark:bg-black">
				<div className="flex h-full min-h-0 flex-1 overflow-hidden">
					{/* Code Split view if in code mode */}
					{isCodeSplit && (
						<div className="relative flex w-1/2 min-w-[480px] shrink-0 flex-col overflow-hidden border-stroke-soft-100 border-r transition-all duration-300 dark:border-stroke-soft-100/40">
							<CodeEditor onClose={() => void setViewMode("visual")} />
						</div>
					)}

					{/* Center/Right panel (Visual builder + inspector/history/variables) */}
					<div className="relative flex min-h-0 flex-1 overflow-hidden bg-bg-white-0 dark:bg-black">
						<main
							className={cn(
								"flex h-full flex-1 flex-col overflow-hidden",
								!isCodeSplit && "pr-72",
							)}
						>
							<SendDetails />
							<GeneratingOverlay />
							{showHtmlCanvas ? (
								<div className="relative min-h-0 flex-1">
									<HtmlEmailPreview editable={!isCodeSplit} />
								</div>
							) : (
								<ScrollAreaPrimitive.Root
									className="relative min-h-0 flex-1 overflow-hidden"
									type="auto"
								>
									<ScrollAreaPrimitive.Viewport className="[&>div]:!block [&>div]:!min-h-full [&>div]:!w-full size-full">
										<FullEmailBuilder />
									</ScrollAreaPrimitive.Viewport>
									<ScrollAreaPrimitive.Scrollbar
										orientation="vertical"
										className={cn(
											"absolute top-0 right-72 bottom-0 z-20 flex w-2.5 touch-none select-none p-0.5 transition-[right] duration-300",
										)}
									>
										<ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-stroke-soft-200 hover:bg-stroke-sub-300 dark:bg-stroke-soft-100/60" />
									</ScrollAreaPrimitive.Scrollbar>
								</ScrollAreaPrimitive.Root>
							)}
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
									className="absolute inset-y-0 right-0 z-10 flex h-full shrink-0 flex-col overflow-hidden border-stroke-soft-100 border-l bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black"
								>
									{/* Top Tabs: Editor | Variables | History */}
									<TemplateInspectorTabs
										viewMode={viewMode}
										onSelectTab={handleSelectTab}
									/>

									<div className="relative h-full w-72 flex-1 overflow-hidden">
										<AnimatePresence
											mode="popLayout"
											custom={direction}
											initial={false}
										>
											<motion.div
												key={currentTab}
												custom={direction}
												variants={slideVariants}
												initial="enter"
												animate="center"
												exit="exit"
												transition={{
													duration: 0.28,
													ease: [0.32, 0.72, 0, 1],
												}}
												className="absolute inset-0 overflow-y-auto overflow-x-hidden"
											>
												{currentTab === "history" && <VersionSidebar />}
												{currentTab === "variables" && (
													<VariablesPanel
														onClose={() => handleSelectTab("visual")}
													/>
												)}
												{currentTab === "visual" && <EmailInspector />}
											</motion.div>
										</AnimatePresence>
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
