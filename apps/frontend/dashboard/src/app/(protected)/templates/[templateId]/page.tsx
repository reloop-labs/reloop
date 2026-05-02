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
				<div className="w-72">
					<p>Untitled Template</p>
				</div>
				<div className="relative m-2 flex flex-1 flex-col rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					<main className="hide-scrollbar relative flex flex-1 flex-col overflow-y-auto rounded-xl">
						<SendDetails />
						<FullEmailBuilder />
					</main>
					<FloatingMenu />
				</div>

				<div className="w-72">
					<EmailInspector />
				</div>
			</div>
		</EditorProvider>
	);
};

export default Page;
