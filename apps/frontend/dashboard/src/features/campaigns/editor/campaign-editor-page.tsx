"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { FullEmailBuilder } from "#/features/templates/editor/components/canvas/email-builder";
import { GeneratingOverlay } from "#/features/templates/editor/components/canvas/generating-overlay";
import { CodeEditor } from "#/features/templates/editor/components/panels/code/code-view";
import { VersionSidebar } from "#/features/templates/editor/components/panels/history/version-sidebar";
import { EmailInspector } from "#/features/templates/editor/inspector";
import { CampaignsProvider } from "../campaigns-provider";
import { CampaignEditorProvider } from "./campaign-editor-provider";
import { CampaignSendDetails } from "./components/campaign-send-details";
import { CampaignVariablesPanel } from "./components/campaign-variables-panel";

const viewModes = ["visual", "code", "history", "variables"] as const;

export function CampaignEditorPage({ campaignId }: { campaignId: string }) {
	const [viewMode, setViewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(viewModes).withDefault("visual"),
	);

	const isCodeSplit = viewMode === "code";

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
										<div className="sticky top-0 z-20 shrink-0 bg-bg-white-0 px-3 dark:bg-black">
											<TabMenuHorizontal.Root
												value={
													viewMode === "variables"
														? "variables"
														: viewMode === "history"
															? "history"
															: "editor"
												}
												onValueChange={(val) => {
													if (val === "editor") void setViewMode("visual");
													else if (val === "variables")
														void setViewMode("variables");
													else if (val === "history")
														void setViewMode("history");
												}}
											>
												<TabMenuHorizontal.List className="h-10 gap-0 border-stroke-soft-200 border-b dark:border-stroke-soft-100/40">
													<TabMenuHorizontal.Trigger
														value="editor"
														className="flex cursor-pointer items-center gap-1.5 px-3 font-medium text-xs text-text-sub-600 data-[state=active]:text-text-strong-950"
													>
														<Icon name="pencil" className="h-3.5 w-3.5" />
														Editor
													</TabMenuHorizontal.Trigger>
													<TabMenuHorizontal.Trigger
														value="variables"
														className="flex cursor-pointer items-center gap-1.5 px-3 font-medium text-xs text-text-sub-600 data-[state=active]:text-text-strong-950"
													>
														<Icon name="brackets" className="h-3.5 w-3.5" />
														Variables
													</TabMenuHorizontal.Trigger>
													<TabMenuHorizontal.Trigger
														value="history"
														className="flex cursor-pointer items-center gap-1.5 px-3 font-medium text-xs text-text-sub-600 data-[state=active]:text-text-strong-950"
													>
														<Icon name="history" className="h-3.5 w-3.5" />
														History
													</TabMenuHorizontal.Trigger>
												</TabMenuHorizontal.List>
											</TabMenuHorizontal.Root>
										</div>

										<div className="h-full w-72 flex-1 overflow-y-auto overflow-x-hidden">
											{viewMode === "history" && <VersionSidebar />}
											{viewMode === "variables" && (
												<CampaignVariablesPanel
													onClose={() => void setViewMode("visual")}
												/>
											)}
											{viewMode !== "history" && viewMode !== "variables" && (
												<EmailInspector />
											)}
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
