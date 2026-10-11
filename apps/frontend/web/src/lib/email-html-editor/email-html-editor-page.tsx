"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { EditorContext } from "@tiptap/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Toaster, toast } from "sonner";
import { FullEmailBuilder } from "./components/canvas/email-builder";
import { EmailSlashCommand } from "./components/canvas/email-slash-command";
import { HtmlEmailPreview } from "./components/canvas/html-preview";
import { CenterNav } from "./components/header/center-nav";
import { SaveTemplateButton } from "./components/header/save-template-button";
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

/** Below Tailwind `md`: the inspector becomes a bottom sheet. */
const PHONE_QUERY = "(max-width: 767px)";

function subscribePhone(onChange: () => void) {
	const query = window.matchMedia(PHONE_QUERY);
	query.addEventListener("change", onChange);
	return () => query.removeEventListener("change", onChange);
}

function useIsPhone() {
	return useSyncExternalStore(
		subscribePhone,
		() => window.matchMedia(PHONE_QUERY).matches,
		() => false,
	);
}

/**
 * Public tool version of the dashboard `TemplateEditorPage`: same canvas,
 * inspector, code split, and variables, without send details, history,
 * publish, or collaboration. "Save template" hands the email to the
 * dashboard, which creates the template after sign-up or sign-in.
 */
export function EmailHtmlEditorPage({
	html,
	variables,
	templateName,
}: {
	/** Absolute-URL email HTML to load on the canvas. */
	html: string;
	variables: ToolVariable[];
	/** Fallback template name when the email has no subject. */
	templateName: string;
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
	const isPhone = useIsPhone();
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	// The sheet only exists on phones; leaving that width or opening code
	// view closes it so it never reappears unexpectedly.
	useEffect(() => {
		if (!isPhone || isCodeSplit) setIsSheetOpen(false);
	}, [isPhone, isCodeSplit]);

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
				{currentTab === "variables" && (
					<VariablesPanel onClose={() => handleSelectTab("visual")} />
				)}
				{currentTab === "visual" && <EmailInspector />}
			</motion.div>
		</AnimatePresence>
	);

	return (
		<EditorContext.Provider value={{ editor }}>
			<Toaster position="bottom-center" />
			<div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				<div className="relative flex shrink-0 items-center border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-2.5 dark:border-stroke-soft-100/40 dark:bg-black">
					<div className="flex shrink-0 items-center">
						<CenterNav />
					</div>
					<nav
						aria-label="Template breadcrumb"
						className="mx-4 flex min-w-0 flex-1 items-center justify-center sm:absolute sm:inset-x-36 sm:mx-0"
					>
						<div className="hidden shrink-0 items-center gap-1.5 sm:flex">
							<Icon name="layout" className="size-4 text-text-sub-600" />
							<Link
								href="/tools/email-html-editor"
								className="font-medium text-label-sm text-text-sub-600 hover:text-text-strong-950"
							>
								Templates
							</Link>
						</div>
						<span
							aria-hidden="true"
							className="ml-2.5 hidden text-text-disabled-300 text-xs sm:inline"
						>
							/
						</span>
						<span
							className="ml-1 truncate rounded-md px-2 py-1 font-semibold text-label-sm text-text-strong-950"
							title={templateName}
							aria-current="page"
						>
							{templateName}
						</span>
					</nav>
					<div className="ml-auto flex shrink-0 items-center gap-2">
						{isPhone && !isCodeSplit && (
							<button
								type="button"
								onClick={() => setIsSheetOpen((open) => !open)}
								aria-expanded={isSheetOpen}
								aria-controls="email-inspector-sheet"
								className={cn(
									"flex h-8 items-center gap-1.5 rounded-lg border border-stroke-soft-100 px-2.5 font-medium text-label-xs text-text-sub-600 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] dark:border-stroke-soft-100/40",
									isSheetOpen
										? "bg-bg-weak-50 text-text-strong-950 dark:bg-white/10 dark:text-white"
										: "bg-bg-white-0 dark:bg-black",
								)}
							>
								<Icon name="brush" className="size-3.5" />
								Style
							</button>
						)}
						<SaveTemplateButton templateName={templateName} />
					</div>
				</div>
				<div className="flex min-h-0 flex-1 items-stretch overflow-hidden bg-bg-white-0 dark:bg-black">
					<div className="flex h-full min-h-0 flex-1 overflow-hidden">
						{isCodeSplit && (
							<div className="relative flex w-full shrink-0 flex-col overflow-hidden border-stroke-soft-100 transition-all duration-300 md:w-1/2 md:min-w-[480px] md:border-r dark:border-stroke-soft-100/40">
								<CodeEditor onClose={() => setViewMode("visual")} />
							</div>
						)}

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
											className="absolute top-0 right-0 bottom-0 z-20 flex w-2.5 touch-none select-none p-0.5 transition-[right] duration-300 md:right-72"
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
								onClick={() => setIsSheetOpen(false)}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="fixed inset-0 z-40 bg-black/20"
							/>
							<motion.div
								key="sheet"
								id="email-inspector-sheet"
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
										onClick={() => setIsSheetOpen(false)}
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
