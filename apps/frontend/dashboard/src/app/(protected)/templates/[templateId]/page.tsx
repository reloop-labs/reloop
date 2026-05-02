"use client";

import dynamic from "next/dynamic";
import { CenterHeader } from "./components/center-header";
import { TemplateInspector } from "./components/template-inspector";
import { TemplateSidebar } from "./components/template-sidebar";
import { TemplateTitle } from "./components/template-title";
import { EditorProvider } from "./editor/editor.provider";

const MyEditor = dynamic(() => import("./editor").then((m) => m.default), {
	ssr: false,
});

const Page = () => {
	return (
		<EditorProvider>
			<div className="flex h-screen overflow-hidden bg-bg-weak-50 dark:bg-black">
				<div>
					<TemplateTitle />
					<TemplateSidebar />
				</div>
				<div className="flex flex-1 flex-col overflow-hidden">
					<main className="relative m-2 flex flex-1 flex-col overflow-y-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
						<CenterHeader />
						<div className="mx-auto max-w-4xl text-text-soft-400">
							<MyEditor />
						</div>
					</main>
				</div>
				<TemplateInspector />
			</div>
		</EditorProvider>
	);
};

export default Page;
