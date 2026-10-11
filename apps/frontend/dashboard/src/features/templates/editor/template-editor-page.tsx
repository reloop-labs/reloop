"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { FullEmailBuilder } from "./components/canvas/email-builder";
import { GeneratingOverlay } from "./components/canvas/generating-overlay";
import { HtmlEmailPreview } from "./components/canvas/html-preview";
import { CodeEditor } from "./components/panels/code/code-view";
import { VersionSidebar } from "./components/panels/history/version-sidebar";
import { VariablesPanel } from "./components/panels/variables/variables-panel";
import { SendDetails } from "./components/send-details/send-details";
import { TemplateInspectorTabs } from "./components/template-inspector-tabs";
import { useEditorStore } from "./hooks/use-editor-store";
import { PHONE_QUERY, useInspectorSheet } from "./hooks/use-inspector-sheet";
import { EmailInspector } from "./inspector";
import { EditorProvider } from "./providers/editor-provider";
import { shouldShowSourceHtmlPreview } from "./utils/should-show-source-html-preview";

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
	const codeHtml = useEditorStore((s) => s.codeHtml);
	const showHtmlCanvas = shouldShowSourceHtmlPreview({
		isCodeSplit,
		codeHtml,
	});
	const currentTab =
		viewMode === "variables"
			? "variables"
			: viewMode === "history"
				? "history"
				: "visual";

	const [_prevTab, setPrevTab] = useState(currentTab);
	const [direction, setDirection] = useState(1);
	const isPhone = useMediaQuery(PHONE_QUERY);
	const isSheetOpen = useInspectorSheet((s) => s.open);
	const setSheetOpen = useInspectorSheet((s) => s.setOpen);

	// The sheet only exists on phones; leaving that width, opening code view,
	// or leaving the editor closes it so it never reappears unexpectedly.
	useEffect(() => {
		if (!isPhone || isCodeSplit) setSheetOpen(false);
	}, [isPhone, isCodeSplit, setSheetOpen]);
	useEffect(() => () => setSheetOpen(false), [setSheetOpen]);

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

	const inspectorPanels = (
		<AnimatePresence mode="popLayout" custom={direction} initial={false}>
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
					<VariablesPanel onClose={() => handleSelectTab("visual")} />
				)}
				{currentTab === "visual" && <EmailInspector />}
			</motion.div>
		</AnimatePresence>
	);

	return (
		<EditorProvider key={templateId} roomId={templateId}>
			<div className="flex h-full min-h-0 flex-1 items-stretch overflow-hidden bg-bg-white-0 dark:bg-black">
				<div className="flex h-full min-h-0 flex-1 overflow-hidden">
					{/* Code Split view if in code mode */}
					{isCodeSplit && (
						<div className="relative flex w-full shrink-0 flex-col overflow-hidden border-stroke-soft-100 transition-all duration-300 md:w-1/2 md:min-w-[480px] md:border-r dark:border-stroke-soft-100/40">
							<CodeEditor onClose={() => void setViewMode("visual")} />
						</div>
					)}

					{/* Center/Right panel (Visual builder + inspector/history/variables) */}
					<div
						className={cn(
							"relative min-h-0 flex-1 overflow-hidden bg-bg-white-0 dark:bg-black",
							// Phones show code full-screen; the pencil toggle returns to the canvas.
							isCodeSplit ? "hidden md:flex" : "flex",
						)}
					>
						<main
							className={cn(
								"template-editor-canvas flex h-full flex-1 flex-col overflow-hidden bg-white text-neutral-950",
								!isCodeSplit && "md:pr-72",
							)}
						>
							<SendDetails />
							<GeneratingOverlay />
							{showHtmlCanvas ? (
								<div className="relative min-h-0 flex-1 bg-white">
									<HtmlEmailPreview editable={false} />
								</div>
							) : (
								<ScrollAreaPrimitive.Root
									className="relative min-h-0 flex-1 overflow-hidden bg-white"
									type="auto"
								>
									<ScrollAreaPrimitive.Viewport className="[&>div]:!block [&>div]:!min-h-full [&>div]:!w-full size-full bg-white">
										<FullEmailBuilder />
									</ScrollAreaPrimitive.Viewport>
									<ScrollAreaPrimitive.Scrollbar
										orientation="vertical"
										className={cn(
											"absolute top-0 right-0 bottom-0 z-20 flex w-2.5 touch-none select-none p-0.5 transition-[right] duration-300 md:right-72",
										)}
									>
										<ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-stroke-soft-200 hover:bg-stroke-sub-300" />
									</ScrollAreaPrimitive.Scrollbar>
								</ScrollAreaPrimitive.Root>
							)}
						</main>
						<AnimatePresence initial={false}>
							{!isCodeSplit && !isPhone && (
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
										{inspectorPanels}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
			<AnimatePresence>
				{isPhone && isSheetOpen && !isCodeSplit && (
					<>
						<motion.button
							key="sheet-backdrop"
							type="button"
							aria-label="Close style panel"
							onClick={() => setSheetOpen(false)}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 z-40 bg-black/20"
						/>
						<motion.div
							key="sheet"
							id="template-inspector-sheet"
							role="dialog"
							aria-label="Style panel"
							initial={{ transform: "translateY(100%)" }}
							animate={{ transform: "translateY(0%)" }}
							exit={{ transform: "translateY(100%)" }}
							transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
							className="fixed inset-x-0 bottom-0 z-50 flex h-[62dvh] flex-col overflow-hidden rounded-t-2xl border-stroke-soft-100 border-t bg-bg-white-0 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_32px_-12px_rgba(0,0,0,0.25)] dark:border-stroke-soft-100/40 dark:bg-black"
						>
							<div className="flex items-center pr-2">
								<div className="min-w-0 flex-1">
									<TemplateInspectorTabs
										viewMode={viewMode}
										onSelectTab={handleSelectTab}
									/>
								</div>
								<button
									type="button"
									onClick={() => setSheetOpen(false)}
									aria-label="Close style panel"
									className="flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
								>
									<Icon name="cross" className="size-4" />
								</button>
							</div>
							<div className="relative min-h-0 flex-1 overflow-hidden">
								{inspectorPanels}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</EditorProvider>
	);
}
