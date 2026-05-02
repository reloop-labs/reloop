"use client";

import { Suspense } from "react";
import { FullEmailBuilder } from "./components/editor";

const Page = () => {
	return (
		<div className="flex h-screen overflow-hidden bg-bg-weak-50 dark:bg-black">
			<div>
				<p>Untitled Template</p>
			</div>
			<div className="flex flex-1 flex-col overflow-hidden">
				<main className="relative m-2 flex flex-1 flex-col overflow-y-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
					?
					<div className="mx-auto max-w-4xl text-text-soft-400">
						<Suspense fallback={<div>Loading Editor...</div>}>
							<FullEmailBuilder />
						</Suspense>
					</div>
				</main>
			</div>
			<p>Inspecct</p>
		</div>
	);
};

export default Page;
