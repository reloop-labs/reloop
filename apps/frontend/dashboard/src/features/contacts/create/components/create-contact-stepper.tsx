import { Icon } from "@reloop/ui/icon";

export type CreateContactStep = "select-method" | "single-contact" | "csv-import" | "api-sync";

interface CreateContactStepperProps {
	currentStep: CreateContactStep;
	onStepClick?: (step: CreateContactStep) => void;
}

export function CreateContactStepper({
	currentStep,
	onStepClick,
}: CreateContactStepperProps) {
	const isMethodSelection = currentStep === "select-method";

	const getStepLabel = () => {
		switch (currentStep) {
			case "single-contact":
				return "Contact details";
			case "csv-import":
				return "Upload CSV file";
			case "api-sync":
				return "Configure API integration";
			default:
				return "Configure method";
		}
	};

	return (
		<div className="space-y-4 font-sans text-sm">
			<div className="space-y-2">
				{/* Main Step 1 */}
				<button
					type="button"
					onClick={() => onStepClick?.("select-method")}
					className="flex items-center gap-2.5 text-left font-medium text-text-strong-950 hover:text-text-sub-600 transition-colors"
				>
					<span className="flex h-4 w-4 items-center justify-center rounded-full bg-text-strong-950 text-[10px] text-bg-white-0">
						<span className="h-1.5 w-1.5 rounded-full bg-bg-white-0" />
					</span>
					<span>Select a method</span>
				</button>

				{/* Sub Step 2 (if selected) */}
				<div className="ml-2.5 border-l border-stroke-soft-200 pl-4 space-y-2 py-1">
					<div
						className={`flex items-center gap-2 text-xs transition-colors ${
							!isMethodSelection
								? "text-text-strong-950 font-medium"
								: "text-text-soft-400"
						}`}
					>
						<span
							className={`h-1.5 w-1.5 rounded-full ${
								!isMethodSelection ? "bg-text-strong-950" : "bg-stroke-soft-200"
							}`}
						/>
						<span>{isMethodSelection ? "Configure settings" : getStepLabel()}</span>
					</div>
				</div>
			</div>

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
					<Icon name="chevron-right" className="h-3 w-3" />
				</a>
			</div>
		</div>
	);
}
