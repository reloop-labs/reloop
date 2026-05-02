"use client";

import { FullEmailBuilder } from "./components/editor";
import { EditorProvider } from "./components/editor-provider";
import { FloatingMenu } from "./components/floating-menu";
import { EmailInspector } from "./components/inspector";
import { SendDetails } from "./components/send-details";

const Page = () => {
	return (
		<EditorProvider>
			<div className="flex h-screen overflow-hidden bg-bg-weak-50 dark:bg-black">
				<div className="w-12" />
				<div className="relative m-2 flex flex-1 rounded-[24px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					<main className="hide-scrollbar relative flex flex-1 flex-col overflow-y-auto">
						<SendDetails />
						<FullEmailBuilder />
					</main>
					<div className="absolute right-2 bottom-2 h-[calc(100vh-34px)] w-[330px] rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100 dark:bg-[#0a0a0a]">
						<EmailInspector />
					</div>
					<FloatingMenu />
				</div>
			</div>
		</EditorProvider>
	);
};

export default Page;
