"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@reloop/ui/cn";
import { EditorContext } from "@tiptap/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { FullEmailBuilder } from "./components/canvas/email-builder";
import { EmailSlashCommand } from "./components/canvas/email-slash-command";
import { HtmlEmailPreview } from "./components/canvas/html-preview";
import { CenterNav } from "./components/header/center-nav";
import { CodeEditor } from "./components/panels/code/code-view";
import { AddTemplateVariableModal } from "./components/panels/variables/add-variable-modal";
import { VariablesPanel } from "./components/panels/variables/variables-panel";
import { TemplateInspectorTabs } from "./components/template-inspector-tabs";
import { type ToolVariable, useEditorStore } from "./hooks/use-editor-store";
import { useToolEditor } from "./hooks/use-tool-editor";
import { EmailInspector } from "./inspector";
import { clearImportedEmailCss } from "./utils/apply-imported-email-css";
import { applySourceHtml } from "./utils/apply-source-html";
import { shouldShowSourceHtmlPreview } from "./utils/should-show-source-html-preview";

const TAB_ORDER: Record<string, number> = {
	visual: 0,
	variables: 1,
};

/**
 * Public tool version of the dashboard `TemplateEditorPage`: same canvas,
 * inspector, code split, and variables, without send details, history,
 * publish, collaboration, or saving. Everything stays in this tab.
 */
export function EmailHtmlEditorPage({
	html,
	variables,
}: {
	/** Absolute-URL email HTML to load on the canvas. */
	html: string;
	variables: ToolVariable[];
}) {
	const editor = useToolEditor();
	const shouldReduceMotion = useReducedMotion();
	const viewMode = useEditorStore((s) => s.viewMode);
	const setViewMode = useEditorStore((s) => s.setViewMode);
	const isCreatingVar = useEditorStore((s) => s.isCreatingVar);
	const setIsCreatingVar = useEditorStore((s) => s.setIsCreatingVar);
	const upsertVariable = useEditorStore((s) => s.upsertVariable);

	const isCodeSplit = viewMode === "code";
	const codeHtml = useEditorStore((s) => s.codeHtml);
	const showHtmlCanvas = shouldShowSourceHtmlPreview({
		isCodeSplit,
		codeHtml,
	});
	const currentTab = viewMode === "variables" ? "variables" : "visual";
	const [direction, setDirection] = useState(1);

	useEffect(() => {
		useEditorStore.getState().reset();
		useEditorStore.getState().setVariables(variables);
		return () => {
			useEditorStore.getState().reset();
			clearImportedEmailCss();
		};
	}, [variables]);

	useEffect(() => {
		if (!editor || !html.trim()) return;
		applySourceHtml(editor, html);
	}, [editor, html]);

	const handleSelectTab = (tab: "visual" | "variables") => {
		const prevIndex = TAB_ORDER[currentTab] ?? 0;
		const nextIndex = TAB_ORDER[tab] ?? 0;
		setDirection(nextIndex >= prevIndex ? 1 : -1);
		setViewMode(tab);
	};

	const handleCreateAndInsertVar = async (
		name: string,
		type: "string" | "number",
		defaultValue: string | null,
	) => {
		if (!name.trim()) {
			throw new Error("Variable name is required");
		}
		if (editor) {
			editor
				.chain()
				.focus()
				.insertContent({ type: "variable", attrs: { name } })
				.run();
		} else {
			const placeholder = `{{{${name}}}}`;
			navigator.clipboard.writeText(placeholder);
			toast.success(`Copied ${placeholder}. Paste it into your email`);
		}
		upsertVariable({ name, type, defaultValue });
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
		<EditorContext.Provider value={{ editor }}>
			<Toaster position="bottom-center" />
			<div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				<div className="relative flex shrink-0 items-center border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-2.5 dark:border-stroke-soft-100/40 dark:bg-black">
					<CenterNav />
				</div>
				<div className="flex min-h-0 flex-1 items-stretch overflow-hidden bg-bg-white-0 dark:bg-black">
					<div className="flex h-full min-h-0 flex-1 overflow-hidden">
						{isCodeSplit && (
							<div className="relative flex w-1/2 min-w-[480px] shrink-0 flex-col overflow-hidden border-stroke-soft-100 border-r transition-all duration-300 dark:border-stroke-soft-100/40">
								<CodeEditor onClose={() => setViewMode("visual")} />
							</div>
						)}

						<div className="relative flex min-h-0 flex-1 overflow-hidden bg-bg-white-0 dark:bg-black">
							<main
								className={cn(
									"template-editor-canvas flex h-full flex-1 flex-col overflow-hidden bg-white text-neutral-950",
									!isCodeSplit && "pr-72",
								)}
							>
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
											className="absolute top-0 right-72 bottom-0 z-20 flex w-2.5 touch-none select-none p-0.5 transition-[right] duration-300"
										>
											<ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-stroke-soft-200 hover:bg-stroke-sub-300" />
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
				<EmailSlashCommand />
			</div>
			<AddTemplateVariableModal
				open={isCreatingVar}
				onOpenChange={setIsCreatingVar}
				onAdd={handleCreateAndInsertVar}
				isSubmitting={false}
			/>
		</EditorContext.Provider>
	);
}
