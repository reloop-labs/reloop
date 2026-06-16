"use client";

import { getGreeting } from "./use-setup-progress";

export function SetupHeader({ firstName }: { firstName: string }) {
	const greeting = getGreeting();

	return (
		<div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="text-left">
				<h1 className="font-bold text-3xl text-text-strong-950 tracking-tight md:text-4xl dark:text-white">
					{greeting}, {firstName} 👋
				</h1>
			</div>
		</div>
	);
}
