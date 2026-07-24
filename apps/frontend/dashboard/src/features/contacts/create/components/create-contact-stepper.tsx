import { Icon } from "@reloop/ui/icon";

export type CreateContactStep =
	| "select-method"
	| "single-contact"
	| "csv-import"
	| "api-sync"
	| "ai-import";

interface CreateContactStepperProps {
	currentStep: CreateContactStep;
	onStepClick?: (step: CreateContactStep) => void;
}

function StepBullet({ status }: { status: "active" | "completed" | "upcoming" }) {
	if (status === "active" || status === "completed") {
		return (
			<span className="flex h-3.5 w-3.5 items-center justify-center shrink-0">
				<span className="h-1.5 w-1.5 rounded-full bg-text-sub-600/60" />
			</span>
		);
	}
	return (
		<span className="flex h-3.5 w-3.5 items-center justify-center shrink-0">
			<span className="h-1.5 w-1.5 rounded-full border border-stroke-soft-300 bg-transparent" />
		</span>
	);
}

export function CreateContactStepper({
	currentStep,
	onStepClick,
}: CreateContactStepperProps) {
	const isMethodSelection = currentStep === "select-method";

	const getStep2Label = () => {
		switch (currentStep) {
			case "single-contact":
				return "Copy & paste details";
			case "csv-import":
				return "Upload CSV file";
			case "api-sync":
				return "Configure REST API";
			case "ai-import":
				return "Import with AI";
			default:
				return "Configure settings";
		}
	};

	return (
		<div className="space-y-6 font-sans">
			{/* Steps List */}
			<div className="space-y-2.5">
				{/* Step 1: Select a Method */}
				<button
					type="button"
					onClick={() => onStepClick?.("select-method")}
					className={`flex items-center gap-2.5 text-left transition-colors cursor-pointer w-full ${
						isMethodSelection
							? "font-medium text-text-sub-600 text-xs"
							: "font-medium text-text-soft-400 text-xs hover:text-text-sub-600"
					}`}
				>
					<StepBullet status={isMethodSelection ? "active" : "completed"} />
					<span>Select a method</span>
				</button>

				{/* Step 2: Only show when a method is selected */}
				{!isMethodSelection && (
					<div className="flex items-center gap-2.5 text-left transition-colors font-medium text-text-sub-600 text-xs">
						<StepBullet status="active" />
						<span>{getStep2Label()}</span>
					</div>
				)}
			</div>

			{/* Documentation Support Section */}
			<div className="pt-6 border-t border-stroke-soft-200/60 text-xs text-text-sub-600 space-y-2">
				<p className="font-medium text-text-strong-950">Need assistance?</p>
				<p className="leading-relaxed text-text-soft-400">
					Learn how to structure custom attributes and contact tags in our documentation.
				</p>
				<a
					href="https://reloop.sh/docs/features/contacts"
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1 text-text-strong-950 hover:underline font-medium pt-1"
				>
					View docs
					<Icon name="arrow-right" className="h-3 w-3" />
				</a>
			</div>
		</div>
	);
}
