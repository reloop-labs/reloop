"use client";

import { useParams } from "next/navigation";
import { FullEmailBuilder } from "./components/editor";
import { EditorProvider } from "./components/editor-provider";
import { GeneratingOverlay } from "./components/generating-overlay";
import { EmailInspector } from "./components/inspector";
import { SendDetails } from "./components/send-details";
import { VersionSidebar } from "./components/version-sidebar";

const Page = () => {
	const params = useParams<{ templateId: string }>();
	const templateId = params.templateId;

	return (
		<EditorProvider key={templateId} roomId={templateId}>
			<div className="flex h-[calc(100vh-45px)] overflow-hidden">
				<div className="relative m-2 flex flex-1 overflow-hidden rounded-[24px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					<VersionSidebar />
					<div className="relative flex flex-1 flex-col overflow-hidden">
						<main className="hide-scrollbar flex-1 overflow-y-auto">
							<SendDetails />
							<GeneratingOverlay />
							<FullEmailBuilder />
						</main>
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
