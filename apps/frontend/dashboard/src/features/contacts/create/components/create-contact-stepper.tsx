import { Icon } from "@reloop/ui/icon";
import { motion } from "motion/react";
import { useUIStore } from "#/store/use-ui-store";

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
			<span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
				<span className="h-1.5 w-1.5 rounded-full bg-text-sub-600/60" />
			</span>
		);
	}
	return (
		<span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
			<span className="h-1.5 w-1.5 rounded-full border border-stroke-soft-300 bg-transparent" />
		</span>
	);
}

export function CreateContactStepper({
	currentStep,
	onStepClick,
}: CreateContactStepperProps) {
	const isMethodSelection = currentStep === "select-method";

	const handleOpenSupport = () => {
		const { setAiPanelActiveTab, setIsAiPanelOpen } = useUIStore.getState();
		setAiPanelActiveTab("support");
		setIsAiPanelOpen(true);
	};

	const getStep2Label = () => {
		switch (currentStep) {
			case "single-contact":
				return "Copy & paste details";
			case "csv-import":
				return "Upload CSV file";
			case "api-sync":
				return "Configure SDK";
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
					className={`flex w-full cursor-pointer items-center gap-2.5 text-left transition-colors ${
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
					<div className="flex items-center gap-2.5 text-left font-medium text-text-sub-600 text-xs transition-colors">
						<StepBullet status="active" />
						<span>{getStep2Label()}</span>
					</div>
				)}
			</div>

			{/* Support Section */}
			<motion.div
				layout
				className="space-y-2 border-t border-stroke-soft-200/60 pt-6 text-text-sub-600 text-xs"
			>
				<p className="font-medium text-text-strong-950">Need assistance?</p>
				<p className="leading-relaxed text-text-soft-400">
					Reach out to our support team for help with contact imports, custom
					attributes, or SDK setup.
				</p>
				<button
					type="button"
					onClick={handleOpenSupport}
					className="inline-flex cursor-pointer items-center gap-1 pt-1 font-medium text-text-strong-950 text-xs hover:underline"
				>
					Contact support
					<Icon name="arrow-right" className="h-3 w-3" />
				</button>
			</motion.div>
		</div>
	);
}
