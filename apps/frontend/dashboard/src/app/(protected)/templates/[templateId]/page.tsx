"use client";

import { useParams } from "next/navigation";
import { CodeEditor } from "./components/code-view";
import { FullEmailBuilder } from "./components/editor";
import { EditorProvider } from "./components/editor-provider";
import {
	ScorePanel,
	TestPanel,
	VariablesPanel,
} from "./components/editor-sidebar-panels";
import { EditorToolbar } from "./components/editor-toolbar";
import { GeneratingOverlay } from "./components/generating-overlay";
import { EmailInspector } from "./components/inspector";
import { SendDetails } from "./components/send-details";
import { useEditorStore } from "./components/use-editor-store";
import { VersionSidebar } from "./components/version-sidebar";

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
						<EditorToolbar />

						{viewMode !== "visual" ? (
							<div className="flex h-full flex-1 overflow-hidden">
								{/* Left side: Code Editor, History or Subpanels */}
								<div className="flex h-full w-1/2 flex-col border-stroke-soft-200 border-r bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-[#080808]">
									{viewMode === "code" && <CodeEditor />}
									{viewMode === "history" && <VersionSidebar />}
									{viewMode === "variables" && (
										<VariablesPanel onClose={() => setViewMode("visual")} />
									)}
									{viewMode === "score" && (
										<ScorePanel onClose={() => setViewMode("visual")} />
									)}
									{viewMode === "test" && (
										<TestPanel onClose={() => setViewMode("visual")} />
									)}
								</div>
								{/* Right side: Visual Editor & Send Details */}
								<main className="hide-scrollbar flex h-full w-1/2 flex-col overflow-y-auto bg-bg-white-0 dark:bg-[#0a0a0a]">
									<SendDetails />
									<GeneratingOverlay />
									<FullEmailBuilder />
								</main>
							</div>
						) : (
							<main className="hide-scrollbar flex h-full flex-1 flex-col overflow-y-auto">
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
