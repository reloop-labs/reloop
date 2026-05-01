"use client";
import dynamic from "next/dynamic";

const InspectorCustom = dynamic(
	() => import("./editor/aa").then((mod) => mod.StandaloneEditorFull),
	{
		ssr: false,
	},
);

import { CenterHeader } from "./components/center-header";
import { TemplateInspector } from "./components/template-inspector";
import { TemplateSidebar } from "./components/template-sidebar";

const Page = () => {
	return (
		<div className="flex h-screen overflow-hidden bg-bg-weak-50 dark:bg-black">
			<div className="w-72">sdflsjd</div>
			<div className="flex flex-1 flex-col overflow-hidden">
				<TemplateSidebar />
				<main className="relative mx-2 mb-2 flex flex-1 flex-col overflow-y-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					<CenterHeader />
					<div className="flex-1 overflow-y-auto p-8">
						{/* Editor content will go here */}
						<div className="mx-auto max-w-2xl text-text-soft-400">
							<InspectorCustom />
						</div>
					</div>
				</main>
			</div>
			<TemplateInspector />
		</div>
	);
};

export default Page;
