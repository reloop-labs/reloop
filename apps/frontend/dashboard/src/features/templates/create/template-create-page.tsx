"use client";

import { PromptBox } from "./components/prompt-box/prompt-box";
import { PromptHeroHeader } from "./components/prompt-hero/prompt-hero-header";
import { useCreateTemplateFlow } from "./hooks/use-create-template-flow";

export function TemplateCreatePage() {
	const { prompt, setPrompt, isSubmitting, handleCreate } =
		useCreateTemplateFlow();

	return (
		<div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center px-4 py-16">
			{/* Ambient background glow */}
			<div className="-translate-x-1/2 pointer-events-none absolute top-1/3 left-1/2 h-[350px] w-[600px] rounded-full bg-primary-base/5 blur-[120px] dark:bg-primary-base/10" />

			{/* Main Content */}
			<div className="relative z-10 flex w-full flex-col items-center">
				<PromptHeroHeader />

				<PromptBox
					prompt={prompt}
					setPrompt={setPrompt}
					onSubmit={() => void handleCreate()}
					isSubmitting={isSubmitting}
				/>
			</div>
		</div>
	);
}
