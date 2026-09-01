"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { FullEmailBuilder } from "#/features/templates/editor/components/canvas/email-builder";
import { GeneratingOverlay } from "#/features/templates/editor/components/canvas/generating-overlay";
import { CodeEditor } from "#/features/templates/editor/components/panels/code/code-view";
import { VersionSidebar } from "#/features/templates/editor/components/panels/history/version-sidebar";
import { EmailInspector } from "#/features/templates/editor/inspector";
import { CampaignsProvider } from "../campaigns-provider";
import { CampaignEditorProvider } from "./campaign-editor-provider";
import { CampaignInspectorTabs } from "./components/campaign-inspector-tabs";
import { CampaignSendDetails } from "./components/campaign-send-details";
import { CampaignVariablesPanel } from "./components/campaign-variables-panel";

const viewModes = ["visual", "code", "history", "variables"] as const;

const TAB_ORDER: Record<string, number> = {
	visual: 0,
	variables: 1,
	history: 2,
};

export function CampaignEditorPage({ campaignId }: { campaignId: string }) {
	const shouldReduceMotion = useReducedMotion();
	const [viewMode, setViewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(viewModes).withDefault("visual"),
	);

	const isCodeSplit = viewMode === "code";
	const currentTab =
		viewMode === "variables"
			? "variables"
			: viewMode === "history"
				? "history"
				: "visual";

	const [prevTab, setPrevTab] = useState(currentTab);
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
		<CampaignsProvider>
			<CampaignEditorProvider key={campaignId} campaignId={campaignId}>
				<div className="flex h-full min-h-0 flex-1 items-stretch overflow-hidden bg-bg-white-0 dark:bg-black">
					<div className="flex h-full min-h-0 flex-1 overflow-hidden">
						{/* Code Split view if in code mode */}
						{isCodeSplit && (
							<div className="relative flex w-1/2 min-w-[480px] shrink-0 flex-col overflow-hidden border-stroke-soft-200 border-r transition-all duration-300 dark:border-stroke-soft-100/40">
								<CodeEditor onClose={() => void setViewMode("visual")} />
							</div>
						)}

						{/* Center/Right panel (Visual builder + inspector/history/variables) */}
						<div className="relative flex min-h-0 flex-1 overflow-hidden bg-bg-white-0 dark:bg-black">
							<main
								className={cn(
									"flex h-full flex-1 flex-col overflow-hidden transition-all duration-300",
									!isCodeSplit && "lg:pl-72",
								)}
							>
								<CampaignSendDetails />
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
										className="flex h-full shrink-0 flex-col overflow-hidden border-stroke-soft-200 border-l bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black"
									>
										{/* Top Tabs: Editor | Variables | History */}
										<CampaignInspectorTabs
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
														<CampaignVariablesPanel
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
			</CampaignEditorProvider>
		</CampaignsProvider>
	);
}
