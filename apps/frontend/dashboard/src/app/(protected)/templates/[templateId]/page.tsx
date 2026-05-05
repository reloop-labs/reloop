"use client";

import { useParams } from "next/navigation";
import { FullEmailBuilder } from "./components/editor";
import { EditorProvider } from "./components/editor-provider";
import { FloatingMenu } from "./components/floating-menu";
import { EmailInspector } from "./components/inspector";
import { SendDetails } from "./components/send-details";
import { AIAssistant } from "./components/ai-assistant";

const Page = () => {
	const params = useParams<{ templateId: string }>();
	const templateId = params.templateId;

	return (
		<EditorProvider roomId={templateId}>
			<div className="flex h-[calc(100vh-45px)] overflow-hidden">
				<div className="w-12" />
				<div className="relative m-2 flex flex-1 rounded-[24px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					<main className="hide-scrollbar relative flex flex-1 flex-col overflow-y-auto">
						<SendDetails />
						<FullEmailBuilder />
					</main>
					<div className="absolute right-2 bottom-2 h-[calc(100vh-79px)] w-72 overflow-y-auto rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
						<EmailInspector />
					</div>
					<FloatingMenu />
					<AIAssistant />
				</div>
			</div>
		</EditorProvider>
	);
};

export default Page;
