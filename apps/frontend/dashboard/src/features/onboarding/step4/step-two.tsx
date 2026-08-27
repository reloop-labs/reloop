import { GenerateApiKeyStep } from "./generate-api-key-step";

export function StepTwo() {
	return (
		<>
			<div className="px-5 pt-8 sm:px-8 lg:px-12">
				<div className="font-medium text-text-soft-400 text-xs">
					Step 2 of 2
				</div>
			</div>

			<div className="flex min-w-0 flex-col gap-4 px-5 pt-2 pb-8 sm:px-8 sm:pb-10 lg:px-12">
				<GenerateApiKeyStep />
			</div>
		</>
	);
}
